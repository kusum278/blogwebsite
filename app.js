//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const request = require("request");
const https = require("https");
const { post } = require("request");

const homeStartingContent = "Hi! Welcome to our blog website. Write your stories and see what others have to say!! ";
const aboutContent = "This is a blog website where you can post your blogs and reads other users blogs";
const contactContent = "Email-kusummahajan27@gmail.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});


app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.post("/form", function(req, res) {
  const firstname = req.body.fname;
  const email = req.body.email;
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
    }]
  }

  const jsonData = JSON.stringify(data);
  const url = "https://us5.api.mailchimp.com/3.0/lists/8482dd67b7";

  const options = {
    method: "POST",
    auth: "kusum:0f81b925862919bbd4e5a8d879079a2f-us5"

  }

  const request = https.request(url, options, function(response) {
    if (response.statusCode=== 200){
      // res.sendFile(__dirname + "/views/partials/success.ejs");
      res.render("success");
    }
   response.on("data", function(data) {
      console.log(JSON.parse(data))
    })
  })
  request.write(jsonData);
  request.end();
  
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
