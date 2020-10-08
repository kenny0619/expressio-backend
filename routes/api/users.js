const express = require("express");
const router = express.Router();
const { model } = require("mongoose");
const passport = require("passport");
const User = model("User");

const { uniqueNamesGenerator, names } = require("unique-names-generator");

const randomName = uniqueNamesGenerator({ dictionaries: [names] });

const auth = require("../auth");
// create registration route
router.post("/users", (req, res, next) => {
  const user = new User();

  user.username = randomName;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user
    .save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

//create login route
router.post("/users/login", (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }
  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();
      // console.log(user.token);
      // console.log(user.toAuthJSON());
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

//endpoint to get the current user's auth payload from their token
router.get("/user/:id", auth.required, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

// update users endpoint
router.put("/user/:id", auth.required, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(() => {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});

module.exports = router;
