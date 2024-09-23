const mongoose = require("mongoose");

const discordUserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the created date
  },
});

const User = mongoose.model("User", discordUserSchema);

module.exports = User;
