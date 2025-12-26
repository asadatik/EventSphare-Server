const express = require("express");
const { sendMessage, getMessages, getUserBySearch, getCorrentChatters } = require("../../controller/chat/message.controller");


const chatRouter = express.Router()

chatRouter.post('/send-message',sendMessage)
chatRouter.get('/get-message',getMessages)
chatRouter.get('/search', getUserBySearch);
chatRouter.get('/current-chatters',getCorrentChatters)

module.exports = chatRouter