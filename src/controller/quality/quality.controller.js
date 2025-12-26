const Quality = require("../../models/Quality");
// const { ObjectId } = require('mongodb');
const { ObjectId } = require('mongodb');

const getAllQuality = async (req, res) => {
    try {
      const allOrder = await Quality.find();
      res.status(200).json(allOrder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
const getSingleQuality = async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID format" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await Quality.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "quality card not found" });
    }

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server Error" });
  }
  };

  module.exports = { getAllQuality,getSingleQuality };