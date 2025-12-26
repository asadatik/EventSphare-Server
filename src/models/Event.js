const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    photo: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      venue: { type: String, required: true },
    },
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ["onsite", "online", "hybrid"],
      required: true,
    },
    organizer: {
      name: { type: String, required: true },
      followers: { type: String, required: false }, // you can use a number if you want exact values
      bio: { type: String, required: false },
      photo: { type: String, required: true },
    },
    description: { type: String, required: true },
    locationMap: { type: String },
    gallery: [{ type: String }], // Array of image URLs
    sponsor: {
      name: { type: String },
      logo: { type: String },
    },
    reviews: [
      {
        name: { type: String, required: true },
        review: { type: String, required: true },
      },
    ],
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    }, 
    meetLinks : { type: String },
    tags: [{ type: String }],
    bookedSeats:[{ type: String }],
    when: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
