const express = require("express");
const { message, getMessages, getSingleMessageById } = require("../../controller/message/message.controller");

const router = express.Router();


router.post("/message", message);
router.get("/getMessages/:conversationId", getMessages);
router.get("/getMessages/:userId", getSingleMessageById);


module.exports = router;
