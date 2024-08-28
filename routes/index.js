var express = require("express");
var router = express.Router();
const fs = require("fs");

router.post("/login", function (req, res, next) {
  try {
    fs.readFile("./files/users.json", (err, data) => {
      if (err) throw err;

      var users = JSON.parse(data);

      var user = users.find((v) => v.username == req.body.username);

      console.log(user);

      if (user?.password && user.password == req.body.password) {
        res.status(200).send({ username: user.username });
      } else {
        res.status(400).send("Username or password incorrect");
      }
    });
  } catch {
    res.status(500).send();
  }
});

router.post("/register", function (req, res, next) {
  try {
    fs.readFile("./files/users.json", (err, data) => {
      if (err) throw err;

      var users = JSON.parse(data);

      var user = users.find((v) => v.username == req.body.username);

      if (user) {
        res.status(400).send("User already exists");
      } else {
        users.push({
          username: req.body.username,
          password: req.body.password,
        });

        fs.writeFile(
          "./files/users.json",
          JSON.stringify(users),
          "utf8",
          (error) => {
            if (error) throw error;
          }
        );

        res.status(200).send("registered");
      }
    });
  } catch {
    res.status(500).send();
  }
});

module.exports = router;
