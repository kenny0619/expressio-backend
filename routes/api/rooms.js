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

module.exports = router;
