const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config").secret;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    hash: String,
    salt: String,
    follows: [{ type: Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

//method for setting user password
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

//method to validate passwords
UserSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

//method on the user model to generate a JWT
UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  );
};

// method to get the JSON representation of a user for authentication
UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    id: this._id,
    token: this.generateJWT(),
  };
};

// method that returns their public profile data
UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    following: false,
  };
};

// User method to follow a room
UserSchema.methods.follow = function (id) {
  if (this.follows.indexOf(id) === -1) {
    this.follows.push(id);
  }

  return this.save();
};
// User method to unfollow a room
UserSchema.methods.unfollow = function (id) {
  this.follows.remove(id);

  return this.save();
};

// method to check if you follow a room
UserSchema.methods.isFollow = function (id) {
  return this.follows.some(function (followId) {
    return followId.toString() === id.toString();
  });
};

model("User", UserSchema);
