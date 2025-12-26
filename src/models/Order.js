const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  eventImage: {
    type: String,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  eventOrganizerEmail: {
    type: String,
    required: true,
  },
  eventOrganizerName: {
    type: String,
    required: true,
  },
  eventOrganizerPhoto: {
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
  amount: {
    type: Number,
    required: true,
  },
  totalTickets: {
    type: Number,
    required: true,
  },
  selectSeatNames: {
    type: Array,
    required: true,
  },
  transitionId: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,  
    required: true,
  },
  refundRequested: {
    type: String,
    enum: ['Requested', 'NotRequested'],  // Adjusted to make sense for a refund request
    default: 'NotRequested',
  },
},
{ timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

