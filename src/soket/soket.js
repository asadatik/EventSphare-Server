// src/soket/soket.js
const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://event-sphere-bice.vercel.app",
  "https://event-sphere-ashen.vercel.app",
];

// REST এর জন্য CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Socket.io CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

// ----- CHAT + CALL logic (তোমার লজিক merge করা) -----

// Messenger map
const userSocketMap = {};
const getReciverSocketId = (receiverId) => userSocketMap[receiverId];

// Call/WebRTC users
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ---- Chat: online users map ----
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", (message) => {
    const { senderId, receiverId, content } = message;
    const receiverSocketId = getReciverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { senderId, content });
    }
    socket.emit("newMessage", { senderId, content });
  });

  // ---- Call: join ----
  socket.on("join", (userName) => {
    if (!userName || typeof userName !== "string") {
      socket.emit("error", "Invalid username");
      return;
    }

    users[socket.id] = {
      name: userName,
      inCall: false,
      socketId: socket.id,
    };

    io.emit("allUsers", users);
  });

  // ---- Call: callUser ----
  socket.on("callUser", ({ userToCall, signalData, from }) => {
    if (!users[userToCall] || !users[from]) {
      socket.emit("error", "User not found");
      return;
    }

    if (users[userToCall].inCall || users[from].inCall) {
      socket.emit("error", "User is already in a call");
      return;
    }

    users[from].inCall = true;
    users[userToCall].inCall = true;

    io.emit("allUsers", users);

    io.to(userToCall).emit("callUser", {
      signal: signalData,
      from,
      name: users[from].name,
    });
  });

  // ---- Call: answerCall ----
  socket.on("answerCall", ({ to, signal }) => {
    if (users[to]) {
      io.to(to).emit("callAccepted", signal);
    }
  });

  // ---- Call: iceCandidate ----
  socket.on("iceCandidate", ({ to, candidate }) => {
    if (to && candidate) {
      io.to(to).emit("iceCandidate", { candidate });
    }
  });

  // ---- Call: endCall ----
  socket.on("endCall", ({ userId }) => {
    if (users[userId]) users[userId].inCall = false;
    if (users[socket.id]) users[socket.id].inCall = false;

    io.to(userId).emit("callEnded");
    io.emit("allUsers", users);
  });

  // ---- Disconnect ----
  socket.on("disconnect", () => {
    if (userId && userId !== "undefined") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    delete users[socket.id];
    io.emit("allUsers", users);

    console.log("Client disconnected:", socket.id);
  });
});

module.exports = { app, server, io, getReciverSocketId, users };
