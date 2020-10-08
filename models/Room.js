const { model, Schema, plugin } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const slug = require("mongoose-slug-generator");

plugin(slug);

const RoomSchema = new Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
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
    slug: this.slug,
    theme: this.theme,
    about: this.about,
    followingsCount: this.followingsCount,
    creator: this.creator.toProfileJSONFor(user),
  };
};

model("Room", RoomSchema);
