
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  
});

module.exports = mongoose.model("Notification", notificationSchema);
