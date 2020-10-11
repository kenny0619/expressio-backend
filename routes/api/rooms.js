const router = require("express").Router();
const { model } = require("mongoose");
const passport = require("passport");

const Room = model("Room");
const User = model("User");
const auth = require("../auth");

// endpoint for creating rooms
router.post("/:id", auth.required, (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }
      const room = new Room(req.body.room);
      room.slug = req.body.room.theme.replace(/\s/g, "-");
      room.creator = user;

      return room.save().then(() => {
        // console.log(room.creator);
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

//endpoint for retrieving rooms by its slug
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

// endpoint for updating rooms info
router.put("/:room", auth.required, (req, res, next) => {
  User.findById(req.params.id).then((user) => {
    if (req.room.creator._id.toString() === req.query.id.toString()) {
      if (typeof req.body.room.theme !== "undefined") {
        req.room.theme = req.body.room.theme;
      }
      if (typeof req.body.room.about !== "undefined") {
        req.room.about = req.body.room.about;
      }

      req.room
        .save()
        .then((room) => {
          return res.json({ room: room.toJSONFor(user) });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// endpoint for deleting rooms
router.delete("/:room", auth.required, (req, res, next) => {
  User.findById(req.params.id).then(() => {
    if (req.room.creator._id.toString() === req.query.id.toString()) {
      return req.room.remove().then(() => {
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

// follow a room
router.post("/:room/follow", auth.required, (req, res, next) => {
  const roomId = req.room._id;

  User.findById(req.query.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.follow(roomId).then(() => {
        return req.room.updateFollowCount().then((room) => {
          return res.json({ room: room.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

//unfollow a room
router.delete("/:room/follow", auth.required, (req, res, next) => {
  const roomId = req.room._id;

  User.findById(req.query.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfollow(roomId).then(() => {
        return req.room.updateFollowCount().then((room) => {
          return res.json({ room: room.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

module.exports = router;
