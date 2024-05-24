const Room = require('../models/room.schema');
const Visitor = require('../models/visitor.schema');
const Music = require('../models/music.schema');

async function createMusic (data) {
  try {
    const music = new Music(data);
    await music.save();
    return music;
  } catch (error) {
    console.error('Error creating music:', error.message);
    throw error;
  }
}

async function getMusicById (id) {
  try {
    const music = await Music.findById(id);
    return music;
  } catch (error) {
    console.error('Error getting music:', error.message);
    throw error;
  }
}

async function getMusicsByRoomId (roomId) {
  try {
    const musics = await Music.find({ roomId });
    return musics;
  } catch (error) {
    console.error('Error getting musics:', error.message);
    throw error;
  }
}

module.exports = {
  createMusic,
  getMusicById,
  getMusicsByRoomId,
};