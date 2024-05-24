const mongoose = require('mongoose');

const Room = require('../models/room.schema'); // Assuming Room model in ./models
const Visitor = require('../models/visitor.schema');

async function createRoom(data) {
  try {
    const room = new Room(data);
    await room.save();
    return room;
  } catch (error) {
    console.error('Error creating room:', error.message);
    throw error; // Re-throw the error for handling in the calling code
  }
}

// Function to get a room by name (optional)
async function getRoomByName(name) {
  try {
    const room = await Room.aggregate([
      {
        $match: {
          name: name
          }
          },
          {
            $lookup: {
              from: 'visitors', // Collection name in the database
              localField: 'visitors', // Field in the Room model
              foreignField: '_id', // Field in the Visitor model
              as: 'visitors', // Array field to store the visitor data
            },
          },
          {
            $lookup: {
              from: 'musics', // Collection name in the database
              localField: '_id', // Field in the Room model
              foreignField: 'roomId', // Field in the Visitor model
              as: 'musics', // Array field to store the visitor data
            },
          }
          ]);
    return room;
  } catch (error) {
    console.error('Error getting room:', error.message);
    throw error; // Re-throw the error for handling in the calling code
  }
}

async function getRoomById(id) {
  try {
    const room = await Room.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id)
          }
          },
          {
            $lookup: {
              from: 'visitors', // Collection name in the database
              localField: 'visitors', // Field in the Room model
              foreignField: '_id', // Field in the Visitor model
              as: 'visitors', // Array field to store the visitor data
            },
          },
          {
            $lookup: {
              from: 'musics', // Collection name in the database
              localField: '_id', // Field in the Room model
              foreignField: 'roomId', // Field in the Visitor model
              as: 'musics', // Array field to store the visitor data
            },
          }
          ]);
    return room;
  } catch (error) {
    console.error('Error getting room:', error.message);
    throw error; // Re-throw the error for handling in the calling code
  }
}

async function updateRoom(id, updates) {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, updates, { new: true });
    return updatedRoom;
  } catch (error) {
    console.error('Error updating room:', error.message);
    throw error;
  }
}


// Function to retrieve a room with populated visitor data
async function getRoomWithVisitors(name) {
    try {
      const room = await Room.findOne({ name })
        .populate('visitors'); // Populate the 'visitors' array with Visitor documents
      return room;
    } catch (error) {
      console.error('Error getting room with visitors:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
  // Function to add a visitor to a room (assuming Visitor model with socketId)
  async function addVisitorToRoom(roomId, visitorId) {
    try {
      const room = await Room.findByIdAndUpdate(roomId, { $push: { visitors: visitorId } });
      if (!room) {
        throw new Error('Room not found');
      }
      return room;
    } catch (error) {
      console.error('Error adding visitor to room:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

  async function removeVisitorFromRoomwWithSocketId(socketId) {
    try {
      const visitor = await Visitor.findOne({ socketId });
      console.log(visitor, 'visitor');
      const findroom = await Room.findOne({ visitors: { $elemMatch: { $eq: visitor._id } } });
      console.log(findroom, 'findroom');
      // Update the room first
      const room = await Room.findOneAndUpdate(
        { visitors: { $elemMatch: { $eq: visitor._id } } },
        { $pull: { visitors: visitor._id } },
        { new: true }
      ).populate('visitors');
      console.log(room, 'roomselan2136142');
      if (!room) {
        throw new Error('Room not found');
      }
      return room;
    } catch (error) {
      console.error('Error removing visitor from room:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

  // Get all rooms with visitors
async function getRooms() {
    try {
      const rooms = await Room.aggregate([
        {
          $lookup: {
            from: 'visitors', // Collection name in the database
            localField: 'visitors', // Field in the Room model
            foreignField: '_id', // Field in the Visitor model
            as: 'visitors', // Array field to store the visitor data
          },
        },
        {
          $lookup: {
            from: 'musics', // Collection name in the database
            localField: '_id', // Field in the Room model
            foreignField: 'roomId', // Field in the Visitor model
            as: 'musics', // Array field to store the visitor data
          },
        }
      ]);
      return rooms;
    } catch (error) {
      console.error('Error getting rooms:', error.message);
      throw error;
    }
  }

  module.exports = {
    createRoom,
    getRoomByName,
    getRoomWithVisitors,
    addVisitorToRoom,
    getRooms,
    getRoomById,
    removeVisitorFromRoomwWithSocketId,
    updateRoom
  };