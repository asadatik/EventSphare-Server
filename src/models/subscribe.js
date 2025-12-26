const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    bg: {
        type: String,
        required: true
    },
    benefits: {
        type: [String],
        required: true
    },
    validity: {
        type: String,
        required: true
    },
    coupon: {
        type: String,
        required: true,
    },
    bookedUserName: {
        type: String,
        required: true,
    },
    bookedUserPhoto: {
        type: String,
        required: true,
    },
    bookedUserEmail: {
        type: String,
        required: true,
    },
    transitionId: {
        type: String,
        required: true,
    },
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
