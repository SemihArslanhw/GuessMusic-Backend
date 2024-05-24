const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  socketId: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  // No password field required as there's no authentication
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
