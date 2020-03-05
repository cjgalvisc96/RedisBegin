const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const redis = require("redis");

//Redis client
let redisClient = redis.createClient();

redisClient.on("connect", function() {
  console.log("Redis connect success");
});

const port = 3000;
const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride("_method"));

// Methods
app.get("/", function(req, res, next) {
  res.render("searchusers");
});
// Add User Page
app.get("/user/add", function(req, res, next) {
  res.render("adduser");
});

app.post("/user/search", function(req, res, next) {
  let id = req.body.id;
  redisClient.hgetall(id, function(err, obj) {
    if (!obj) {
      res.render("searchUsers", {
        error: "Users does not exists"
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj
      });
    }
  });
});

app.post("/user/add", function(req, res, next) {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;

  redisClient.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone
    ],
    function(err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

// Delete User
app.delete("/user/delete/:id", function(req, res, next) {
  redisClient.del(req.params.id);
  res.redirect("/");
});

//Server
app.listen(port, function() {
  console.log("Server run in :" + port);
});
