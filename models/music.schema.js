const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
    artist: {
        type: String,
        required: true,
    },
    roomId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
    },
    path : {
        type: String,
        required: true,
    },
    questions: {
        type: Array,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
  // No password field required as there's no authentication
});

const Musics = mongoose.model('Musics', musicSchema);

module.exports = Musics;
