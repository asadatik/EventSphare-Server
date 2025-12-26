const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    BG: {
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
    }
});

const Quality = mongoose.model('Quality', qualitySchema);

module.exports = Quality;
