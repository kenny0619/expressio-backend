const router = require("express").Router();
const { model } = require("mongoose");
const passport = require("passport");

const Room = model("Room");
const User = model("User");
const auth = require("../auth");

// endpoint for creating rooms
router.post("/", auth.required, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }
      const room = new Room(req.body.room);

      room.creator = user;

      return room.save().then(() => {
        console.log(room.creator);
        return res.json({ room: room.toJSONFor(user) });
      });
    })
    .catch(next);
});

// router.param to intercept & prepopulate room data from the slug
router.param("room", (req, res, next, slug) => {
  Room.findOne({ slug: slug })
    .populate("creator")
    .then((room) => {
      if (!room) {
        return res.sendStatus(404);
      }

      req.room = room;

      return next();
    })
    .catch(next);
});

//endpoint for retrieving by its slug
router.get("/:room", auth.optional, (req, res, next) => {
  Promise.all([
    req.params ? User.findById(req.params.id) : null,
    req.room.populate("creator").execPopulate(),
  ])
    .then((results) => {
      const user = results[0];

      return res.json({ room: req.room.toJSONFor(user) });
    })
    .catch(next);
});

module.exports = router;
