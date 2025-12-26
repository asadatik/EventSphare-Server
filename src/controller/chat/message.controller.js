const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const User = require("../../models/User");
const { io, getReciverSocketId } = require("../../soket/soket");




const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        const reciverId = req.query.reciverId;
        const senderId = req.query.senderId;

        // Check if senderId and reciverId are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(reciverId)) {
            return res.status(400).json({ success: false, message: "Invalid sender or receiver ID" });
        }

        let chats = await Conversation.findOne({
            participants: { $all: [senderId, reciverId] }
        });

        // If no conversation exists, create a new one
        if (!chats) {
            chats = await Conversation.create({
                participants: [senderId, reciverId],
            });
        }

        // Create new message
        const newMessages = new Message({
            senderId,
            reciverId,
            message: messages,
            conversationId: chats._id,
        });

        // Push the new message ID to the conversation's messages array
        if (newMessages) {
            chats.messages.push(newMessages._id);
        }

        // Save the conversation and message
        await Promise.all([chats.save(), newMessages.save()]);


        const reciverSocketId = getReciverSocketId
        (reciverId);
        if(reciverSocketId){
           io.to(reciverSocketId).emit("newMessage",newMessages)
        }

        // Send the new message back as a response
        res.status(201).send(newMessages);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message || 'An error occurred'
        });
        console.log(`Error in sendMessage: ${error}`);
    }
};
    
const getMessages = async (req, res) => {
  try {
      const reciverId = req.query.reciverId;
      const senderId = req.query.senderId;

      // Check if senderId and receiverId are valid ObjectIds-->
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(reciverId)) {
          return res.status(400).json({ success: false, message: "Invalid participant IDs" });
      }

      const chats = await Conversation.findOne({
          participants: { $all: [senderId, reciverId] }
      }).populate("messages");

      if (!chats) return res.status(200).send([]);

      const message = chats.messages;
      res.status(200).send(message);
  } catch (error) {
      res.status(500).send({
          success: false,
          message: error.message || 'An error occurred'
      });
      console.log(`Error in getMessages: ${error}`);
  }
};

const getUserBySearch = async (req, res) => {
      try {
          const search = req.query.search || '';  
          const currentUserID = req.query.id;   
          const user = await User.find({
              $and: [
                  {
                      $or: [
                          { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                          { email: { $regex: '.*' + search + '.*', $options: 'i' } }
                      ]
                  }, {
                      _id: { $ne: currentUserID }
                  }
              ]
          }).select("-password").select("email")
  
          res.status(200).send(user)
  
      } catch (error) {
          res.status(500).send({
              success: false,
              message: error
          })
          console.log(error);
      }
}
  
const getCorrentChatters = async (req, res) => {
    try {
        const currentUserID = req.query.id;

        // Check if currentUserID is valid ObjectId--->
        if (!mongoose.Types.ObjectId.isValid(currentUserID)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const currenTChatters = await Conversation.find({
            participants: currentUserID
        }).sort({
            updatedAt: -1
        });

        if (!currenTChatters || currenTChatters.length === 0) return res.status(200).send([]);

        const partcipantsIDS = currenTChatters.reduce((ids, conversation) => {
            const otherParticipents = conversation.participants.filter(id => id.toString() !== currentUserID);
            return [...ids, ...otherParticipents];
        }, []);

        const otherParticipentsIDS = partcipantsIDS.filter(id => id.toString() !== currentUserID.toString());

        const user = await User.find({ _id: { $in: otherParticipentsIDS } }).select("-password").select("-email");

        const users = otherParticipentsIDS.map(id => user.find(user => user._id.toString() === id.toString()));

        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message || 'An error occurred'
        });
        console.log(`Error in getCorrentChatters: ${error}`);
    }
};

module.exports = {sendMessage,getMessages,getUserBySearch,getCorrentChatters};