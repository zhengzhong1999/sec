//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: String
  });

userSchema.plugin(passportLocalMongoose);

// use encryption
//userSchema.plugin(encrypt, {secret: process.env.SECRET});

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





/**************************************** Home ***********************************************/
app.route("/")

.get(
  function(req, res) {
    res.render("home");
  }
);

/**************************************** Regitser ***********************************************/

app.route("/register")

.get(
  function(req, res) {
    res.render("register");
  }
)

.post(function(req, res) {

  User.register({username: req.body.username, aactive: false}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register');
    }
    else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/game");
      });
    }
  });
});

/**************************************** render index page ***********************************************/


app.route("/game")

.get(function(req, res) {
  if (req.isAuthenticated()) {
    res.render("index");
  }
  else{
    res.redirect('/login');
  }
});



/**************************************** Login ***********************************************/
app.route("/login")

.get(
  function(req, res) {
    res.render("login");
  }
)

.post(function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user,function(err) {
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function() {
        res.redirect("/game");
      });
    }
  });

});

/**************************************** Log Uut ***********************************************/


app.route("/logout")

.get(function(req, res) {
  req.logout();
  res.redirect('/');
});



/**************************************** Submit ***********************************************/


app.route("/submit")

.get(function(req, res) {
  res.render("submit");
})


.post(function(req, res) {
  // deal with new secrets
  res.render("secrets");
});



/**************************************** Run Server ***********************************************/

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
