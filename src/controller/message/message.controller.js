const { ObjectId, BSON } = require("mongodb");
const Message = require("../../models/Message");


// message post korbo
const message = async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    console.log(savedMessage)
    res.status(200).json(savedMessage)
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// conversation id dia message get korbo
const getMessages = async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    const messages = await Message.find({
      conversationId: conversationId
    })
    res.status(200).json(messages)
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const getSingleMessageById = async (req, res) => {
  try {

    const userId = new BSON.ObjectId(req.params.id)
    const message = await Message.findById(userId);

    if (!userId) {
      console.error("User ID is missing or invalid");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }
    res.send(message);

  } catch (error) {
    res.send({
      message: error.message,
    })
  }
}
module.exports = { message, getMessages, getSingleMessageById };



