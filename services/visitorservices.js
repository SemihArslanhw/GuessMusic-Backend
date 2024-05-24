const Visitor = require('../models/visitor.schema');
const Room = require('../models/room.schema');
const RoomService = require('./roomservices');


// Function to create a new visitor
async function createVisitor(name, socketId) {
    try {
      const visitor = new Visitor({ name, socketId });
      await visitor.save();
      return visitor;
    } catch (error) {
      console.error('Error creating visitor:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

// Function to get 10 visitors with the most points
async function getTopVisitors() {
    try {
      const topVisitors = await Visitor.find().sort({ points: -1 }).limit(10);
      return topVisitors;
    } catch (error) {
      console.error('Error getting top visitors:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
  // Function to delete a visitor (by socketId)
  async function deleteVisitor(socketId) {
    try {
      const deletedVisitor = await Visitor.deleteOne({ socketId });
      return deletedVisitor.deletedCount === 1; // Return true if 1 visitor deleted
    } catch (error) {
      console.error('Error deleting visitor:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
  // Function to join a room (assuming Room schema exists)
  async function joinRoom(visitorId, roomId) {
    try {
      // Assuming Room model has a method to add visitors (replace with actual logic)
      const room = await Room.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      await RoomService.addVisitorToRoom(roomId, visitorId); // Replace with actual room.addVisitor logic
      return true;
    } catch (error) {
      console.error('Error joining room:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
  // Function to get visitor by socket ID
  async function getVisitorBySocketId(socketId) {
    try {
      const visitor = await Visitor.findOne({ socketId:socketId });
      return visitor;
    } catch (error) {
      console.error('Error getting visitor:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }

  async function addPointsToVisitor(visitorId, points) {
    try {
      const visitor = await Visitor.findById(visitorId);
      visitor.points += points;
      await visitor.save();
      return visitor;
    } catch (error) {
      console.error('Error adding points to visitor:', error.message);
      throw error; // Re-throw the error for handling in the calling code
    }
  }
  
  module.exports = {
    createVisitor,
    deleteVisitor,
    joinRoom,
    getVisitorBySocketId,
    addPointsToVisitor,
    getTopVisitors,
  };