const express = require("express");
const { newConversation, getConvertation } = require("../../controller/conversation/conversation.controller");
const router = express.Router();


router.post("/newConversation", newConversation);
router.get("/getConvertation/:id", getConvertation);


module.exports = router;
