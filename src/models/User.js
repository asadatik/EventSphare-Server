
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    city: String,
    country: String,
    gender: String,
    skills: String,
    birth: String,
    block: Boolean,
    aboutMe: String,
    specialty: String,
    CEOEmail: String,
    socialPlatform: String,
    location: String,
    companyName: String,
    organizer: Boolean,
    block: Boolean,
    
    followers: [{ type: String }],
    review: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        photo: { type: String }, // Optional if not required
        message: { type: String},
        rating: { type: Number},
      }
    ],
    email: {
      type: String,
      unique: true
    },
    gender: {
      type: String,
      // enum: ['Male', 'Female'] // Restricting gender values to specific options
    },
    specialty: String,
    password: {
      type: String,
      required: true,
    },
    notifications: [
      {
        type: { type: String, enum: ["payment", "follow", "event", "video-call" , "community_post"], required: true },
        message: { type: String, required: true },
        route: { type: String, default: null },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    
    role: {
      type: String, // Specify the type
      enum: ["user", "admin", "organizer"],
      default: "user",
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
