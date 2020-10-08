const { model, Schema } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const User = model("User");

const RoomSchema = new Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    theme: String,
    about: String,
    followed: user ? user.isFollow(this._id) : false,
    followingsCount: { type: Number, default: 0 },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RoomSchema.plugin(uniqueValidator, { message: "is already taken" });

// method to get the JSON representation of a room
RoomSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    theme: this.theme,
    about: this.about,
    followingsCount: this.followingsCount,
    creator: this.creator.toProfileJSONFor(user).username,
  };
};

// method to update a room's followers count
RoomSchema.methods.updateFollowCount = function () {
  const room = this;

  return User.count({ follows: { $in: [room._id] } }).then(function (count) {
    room.followingsCount = count;

    return room.save();
  });
};

model("Room", RoomSchema);
