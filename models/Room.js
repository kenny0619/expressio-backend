const { model, Schema } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const RoomSchema = new Schema(
  {
    theme: String,
    about: String,
    followingsCount: { type: Number, default: 0 },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

RoomSchema.plugin(uniqueValidator, { message: "is already taken" });

RoomSchema.methods.toJSONFor = function (user) {
  return {
    theme: this.theme,
    about: this.about,
    followingsCount: this.followingsCount,
    creator: this.creator.toProfileJSONFor(user),
  };
};

model("Room", RoomSchema);
