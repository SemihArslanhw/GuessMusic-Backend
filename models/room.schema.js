const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String,
    required: true,
  },
  // Define visitor association (assuming an array of visitor IDs)
  visitors: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Visitor', // Reference Visitor model
  },
  currentMusicIndex: {
    type: Number,
    default: 0,
  },
  isGameStarted: {
    type: Boolean,
    default: false,
  },
  // Add other room properties as needed (e.g., creation date, etc.)
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;