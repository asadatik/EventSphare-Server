// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

// এখান থেকে app, server, io আসছে (socket + cors configured)
const { app, server, io, users } = require("../src/soket/soket.js");

// Route imports
const eventRoute = require("../src/routes/events/event.route.js");
const userRoute = require("../src/routes/user/user.route.js");
const orderRoute = require("../src/routes/order/order.route.js");
const postRoute = require("../src/routes/posts/posts.route.js");
const qualityRoute = require("../src/routes/quality/quality.route.js");
const subscribeRoute = require("../src/routes/subscribe/subscribe.route.js");
const convertation = require("../src/routes/convertation/convertation.route.js");
const message = require("../src/routes/message/message.route.js");
const stats = require("../src/routes/stats/stats.js");
const chatRoute = require("../src/routes/chat/chat.route.js");

// Notification model
const Notification = require("../src/models/notification");

// ===== Middleware =====
app.use(express.json());

// (উপরের soket.js এ already cors আছে, চাইলে এখানে আর দেবার দরকার নেই)

// ===== Application routes =====
app.use("/events", eventRoute);
app.use("/", userRoute);
app.use("/", orderRoute);
app.use("/", postRoute);
app.use("/", qualityRoute);
app.use("/", subscribeRoute);
app.use("/", convertation);
app.use("/", message);
app.use("/", stats);
app.use("/", chatRoute);

// ===== MongoDB Connection =====
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qnwtz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri, { dbName: process.env.DB_NAME })
  .then(() => console.log(`Connected to MongoDB`))
  .catch((err) => console.error(err));

// ===== Notification Routes (unchanged) =====
app.post("/send-notification", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res
      .status(400)
      .send({ success: false, message: "User ID and message are required." });
  }

  try {
    await Notification.create({ userId, message });
    res
      .status(200)
      .send({ success: true, message: "Notification sent successfully." });
  } catch (error) {
    console.error("Error sending notification:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to send notification." });
  }
});

app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userNotifications = await Notification.find({ userId });

    if (!userNotifications || userNotifications.length === 0) {
      return res
        .status(404)
        .send({
          success: false,
          message: "No notifications found for this user",
        });
    }

    res.status(200).send({ success: true, data: userNotifications });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res
      .status(500)
      .send({ success: false, message: "Failed to retrieve notifications" });
  }
});

// ===== Basic routes (unchanged) =====
app.get("/", (req, res) => {
  res.send("Welcome to Event Sphere app!");
});

app.all("*", (req, res) => {
  res.status(404).send({
    message: "Page not found - 404",
  });
});

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", users: Object.keys(users).length });
});

// ===== Error handling =====
server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

// ===== Start server =====
const port = process.env.PORT || 9000;

server.listen(port, () => {
  console.log(`Event Sphere app listening on port ${port}`);
});
