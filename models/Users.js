const mongoose = require("mongoose");

const UserSchima = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    role:{
      type:String,
      enum:["admin","user"],
      default:"user",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UserSchima);
