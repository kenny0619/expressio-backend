const router = require("express").Router();
const { model } = require("mongoose");

const User = model("User");
const auth = require("../auth");

// Prepopulate req.profile with the user's data when the :username parameter is contained within a route
router.param("username", (req, res, next, username) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res.sendStatus(404);
      }

      req.profile = user;

      return next();
    })
    .catch(next);
});

// endpoint to fetch a user's profile by their username
router.get("/:username", auth.optional, (req, res, next) => {
  if (req.params) {
    User.findById(req.params.id).then((user) => {
      if (!user) {
        return res.json({ profile: req.toProfileJSONFor(false) });
      }
    });
  } else {
    return res.json({ profile: req.profile.toProfileJSONFor() });
  }
});

module.exports = router;
