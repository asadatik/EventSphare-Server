const { ObjectId } = require("mongodb");
const Conversation = require("../../models/Conversation");


const newConversation = async (req, res) => {
    const members = [req.body.senderId, req.body.receiverId];

    try {
        const result = await Conversation.create({ members })
        console.log(result)
        res.send(result)
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// get conversation with Id
const getConvertation = async (req, res) => {
    const userId = req.params.id;
    try {
        const conversation = await Conversation.find({
            members: {$in: [userId]},
        })
        res.status(200).json(conversation)
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { newConversation, getConvertation };



