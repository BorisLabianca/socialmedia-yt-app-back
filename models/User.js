const mongoose = require("mongoose");

const USerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "The first name is required."],
    },
    lastName: {
      type: String,
      required: [true, "The last name is required."],
    },
    email: {
      type: String,
      required: [true, "An email address is required."],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "A password address is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: true,
    },
    location: { type: String },
    profileUrl: { type: String },
    profession: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    views: [{ type: String }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", USerSchema);

module.exports = User;
