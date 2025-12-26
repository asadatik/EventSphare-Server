
const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "https://event-sphere-bice.vercel.app"],
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {};

// Helper function to get the socket ID of a recipient by their user ID
const getReciverSocketId = (receiverId) => userSocketMap[receiverId];

// Handle connection
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId !== "undefined") userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Listen for message events from the client
    socket.on("sendMessage", (message) => {
        const { senderId, receiverId, content } = message;

        // Find the receiver's socket ID
        const receiverSocketId = getReciverSocketId(receiverId);

        if (receiverSocketId) {
            // Send the message directly to the receiver
            io.to(receiverSocketId).emit("newMessage", {
                senderId,
                content,
            });
        }

        // Send the message back to the sender (for confirmation or to update UI)
        socket.emit("newMessage", {
            senderId,
            content,
        });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

module.exports = { app, io, server, getReciverSocketId };
