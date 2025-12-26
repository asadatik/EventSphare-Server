
const mongoose = require("mongoose");

// Define the schema for user
const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  profile_picture: {
    type: String,
  }
});

// Define the schema for comments
const commentSchema = new mongoose.Schema({
  user: {
    type: userSchema,
  },
  text: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Define the schema for the main post
const postSchema = new mongoose.Schema({
  user: {
    type: userSchema,
  },
  content: {
    title: {
      type: String,
    },
    text: {
      type: String,
      required: false
    },
    media: {
      type: [String] // Array of URLs for media
    }
  },
  reactions: {
    love: {
      type: Number,
      default: 0
    }
  },
  comments: [commentSchema], // Array of comments
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Posts = mongoose.model("Posts", postSchema);

module.exports = Posts;

