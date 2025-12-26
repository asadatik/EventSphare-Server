const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require("dotenv").config();
const mongoose = require("mongoose");
const { app } = require('../src/soket/soket.js');
const port = 9000;
const server = http.createServer(app); 
// Route imports//
const eventRoute = require("../src/routes/events/event.route.js");
const userRoute = require("../src/routes/user/user.route.js");
const orderRoute = require("../src/routes/order/order.route.js");
const postRoute = require("../src/routes/posts/posts.route.js");
const qualityRoute = require("../src/routes/quality/quality.route.js");
const subscribeRoute = require("../src/routes/subscribe/subscribe.route.js");
const convertation = require("../src/routes/convertation/convertation.route.js");
const message = require("../src/routes/message/message.route.js");
const stats = require("../src/routes/stats/stats.js");
const  chatRoute = require("../src/routes/chat/chat.route.js");




// Import Notification model
const Notification = require("../src/models/notification");

// Middleware//
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000", "http://localhost:3001", "https://event-sphere-bice.vercel.app",
    ],
    credentials: true,
  })
);

// Socket.IO Middleware with consistent CORS policy
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", "http://localhost:3001", "https://event-sphere-bice.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000
});
// Application routes
app.use('/events', eventRoute);
app.use('/', userRoute);
app.use('/', orderRoute);
app.use('/', postRoute);
app.use('/', qualityRoute);
app.use('/', subscribeRoute);
app.use('/', convertation);
app.use('/', message);
app.use('/', stats);
app.use('/', chatRoute);
// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qnwtz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(uri, { dbName: process.env.DB_NAME })
  .then(() => console.log(`Connected to MongoDB`))
  .catch((err) => console.error(err));

// ---- Notification Routes ----

app.post('/send-notification', async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).send({ success: false, message: "User ID and message are required." });
  }

  try {
    // Save the notification to the database
    await Notification.create({ userId, message });
    res.status(200).send({ success: true, message: "Notification sent successfully." });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send({ success: false, message: "Failed to send notification." });
  }
});

// Route to get notifications for a specific user
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find notifications that match the user's _id
    const userNotifications = await Notification.find({ userId });

    if (!userNotifications || userNotifications.length === 0) {
      return res.status(404).send({ success: false, message: "No notifications found for this user" });
    }

    res.status(200).send({ success: true, data: userNotifications });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).send({ success: false, message: "Failed to retrieve notifications" });
  }
});


// ---------- End of Notification Routes ----------

// Send message to browser
app.get("/", (req, res) => {
  res.send("Welcome to Event Sphere app!");
});
// 404 route
app.all('*', (req, res) => {
  res.status(404).send({
    message: "Page not found - 404",
  });
});

let users = {};
// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', users: Object.keys(users).length });
});

// WebSocket events
io.on('connection', (socket) => {
  console.log("User connected:", socket.id);

  socket.on('join', (userName) => {
    if (!userName || typeof userName !== 'string') {
      socket.emit('error', 'Invalid username');
      return;
    }


    users[socket.id] = {
      name: userName,
      inCall: false,
      socketId: socket.id
    };


    io.emit('allUsers', users);
  });




// for chating i add it: 
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });

  socket.on('getOnlineUsers', (userId) => {
      // Handle online users here
  });
});





  socket.on("callUser", ({ userToCall, signalData, from }) => {
    if (!users[userToCall] || !users[from]) {
      socket.emit('error', 'User not found');
      return;
    }


    if (users[userToCall].inCall || users[from].inCall) {
      socket.emit('error', 'User is already in a call');
      return;
    }


    users[from].inCall = true;
    users[userToCall].inCall = true;


    io.emit('allUsers', users);


    io.to(userToCall).emit("callUser", {
      signal: signalData,
      from,
      name: users[from].name
    });
  });


  socket.on("answerCall", ({ to, signal }) => {
    if (users[to]) {
      io.to(to).emit("callAccepted", signal);
    }
  });


  socket.on("iceCandidate", ({ to, candidate }) => {
    if (to && candidate) {
      io.to(to).emit("iceCandidate", { candidate });
    }
  });


  socket.on("endCall", ({ userId }) => {
    if (users[userId]) users[userId].inCall = false;
    if (users[socket.id]) users[socket.id].inCall = false;


    io.to(userId).emit("callEnded");
    io.emit('allUsers', users);
  });


  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('allUsers', users);
  });
});


// Error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});


process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});


process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});


// Listening on server instead of app
server.listen(port, () => {
  console.log(`Event Sphere app listening on port ${port}`);
});



