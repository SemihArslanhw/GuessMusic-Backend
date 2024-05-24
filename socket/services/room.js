const roomservices = require('../../services/roomservices');
const visitorservices = require('../../services/visitorservices');

let gameIntervals = {}; // Store game intervals for each room

module.exports = function handleRoomJoining(io) {
  async function sendRoomInfo(io, roomId) {
    // Set interval to send room information every second
    const intervalId = setInterval(async () => {
        var countForMusicSend = 15;
  
        try {
            // Get the latest room information from the database
            let room = await roomservices.getRoomById(roomId);
            room = room[0]
            if (!room) {
                // If room not found, clear the interval and return
                clearInterval(intervalId);
                return;
            }

            // Check if the room has enough players to start the game
            if (room.visitors.length < 2) {
                room.isGameStarted = false;
                room.currentMusicIndex = 0;
                roomservices.updateRoom(room._id, room);
                countForMusicSend = 15;
            }
            if (room.visitors.length == 0) {
              clearInterval(intervalId);
              io.in(roomId).emit('game end', { message: `Game end in room '${roomId}'` });
              room.isGameStarted = false;
              room.currentMusicIndex = 0;
              roomservices.updateRoom(room._id, room);
              countForMusicSend = 15;
            }
            if (room.visitors.length >= 2) {
                countForMusicSend = 15;
                console.log('Visitor has arrived')
                // If enough players, clear the interval
                clearInterval(intervalId);
                // If enough players, emit a message to start the game
                room.isGameStarted = true;
                roomservices.updateRoom(room._id, room);
                roomreq = await roomservices.getRoomById(roomId);
                room = roomreq[0]
                console.log(room, 'room')
                io.in(roomId).emit('game start', { data: room, message: `Game starting in room '${roomId}'`});
                console.log(gameIntervals, 'gameIntervals')
                const gameIntervalId = setInterval(async () => {
                    gameIntervals[roomId] = gameIntervalId;
                    try {
                        // Get the latest game information from the database
                        let room = await roomservices.getRoomById(roomId);
                        room = room[0]
                        if (!room) {
                            // If room not found, clear the interval and return
                            clearInterval(gameIntervalId);
                            return;
                        }

                        if(room.visitors.length < 2){
                          clearInterval(gameIntervalId);
                          gameIntervals[roomId] = null;
                          io.in(roomId).emit('game end', { message: `Game end in room '${roomId}'` });
                          countForMusicSend = 15;
                          return;
                        }
                        io.in(roomId).emit('game info', { room });
                    } catch (error) {
                        console.error('Error sending game info:', error);
                    }
                }
                , 1000); // Send game information every 1 second
            } else {
                // If not enough players, emit a message to wait for more players
                io.in(roomId).emit('wait for players', { message: `Waiting for more players in room '${roomId}'` });
            }

            // Emit the room information to all clients in the room
            io.in(roomId).emit('room info', { room });
        } catch (error) {
            console.error('Error sending room info:', error.message);
        }
    }, 1000); // Send room information every 1 second
}

  io.on('connection', (socket) => {
    let visitor; // Variable to store visitor information
    // Send rooms data to the client (optional)
      roomservices.getRooms().then((rooms) => {
          socket.emit('rooms', {
              rooms,
          });
      }).catch((error) => {
          console.error('Error getting rooms:', error.message);
      });

      visitorservices.getTopVisitors().then((topVisitors) => {
        socket.emit('top visitors', {
            topVisitors,
        });
    }).catch((error) => {
        console.error('Error getting top visitors:', error.message);
    });
  
      socket.on('join', async ( data ) => {
          try {
            // Retrieve visitor information or create a new one
            visitor = await visitorservices.getVisitorBySocketId(socket.id);
            if (!visitor) {
              visitor = await visitorservices.createVisitor(data.name, socket.id);
            }
        
            // Update visitor information (optional, based on your needs)
            visitor.name = data.name; // Assuming `name` is sent from the client
            // Send visitor information to the client (optional)
            socket.emit('visitor info', visitor);
          } catch (error) {
            console.error('Error joining room:', error.message);
            socket.emit('join error', { message: 'An error occurred' }); // Generic error message
          }
        });
  
        socket.on('answer', async (data) => {
          console.log('answer')
          const { roomId, answer, musicIndex } = data;
          try {
            // Check if the answer is correct
            let room = await roomservices.getRoomById(roomId);
            room = room[0]
            if (!room) {
              // Handle error: room not found (optional)
              socket.emit('answer error', { message: `Room '${roomId}' does not exist` });
              return;
            }
        
            // Check if the answer is correct
            const isCorrect = room.musics[musicIndex].answer === answer;
            console.log(room.musics)
            if (isCorrect) {
              // Update the visitor's score
              visitor = await visitorservices.getVisitorBySocketId(socket.id);
              res = await visitorservices.addPointsToVisitor(visitor._id, 10);
              topVisitors = await visitorservices.getTopVisitors();
              room = await roomservices.getRoomById(roomId);
              room = room[0]
              // Emit a message to the room about the correct answer (optional)
              io.emit('top visitors', {
                topVisitors,
              });
              socket.emit('correct answer', { room });
              io.in(roomId).emit('room info', { room });
            } else {
              // Emit a message to the room about the wrong answer (optional)
              socket.emit('wrong answer', { room });
            }
          } catch (error) {
            console.error('Error answering:', error.message);
            socket.emit('answer error', { message: 'An error occurred while answering' }); // Specific error message
          }
        });

        socket.on('joinRoom', async (data) => {
          const { roomId } = data;
          try {
            if (!visitor) {
              // Handle error: visitor not found (optional)
              socket.emit('join error', { message: 'You need to connect as a visitor first' });
              return;
            }
        
            // Check if room exists in the database
            let existingRoom = await roomservices.getRoomById(roomId);
            existingRoom = existingRoom[0]
            if (!existingRoom) {
              // Handle error: room not found
              socket.emit('join error', { message: `Room '${roomId}' does not exist` });
              return;
            }

            // Join the room
            socket.join(roomId);
            await visitorservices.joinRoom(visitor._id, roomId); // Join using visitor ID
        
            const userCount = io.sockets.adapter.rooms.get(roomId).size;

            // Broadcast a message to the room about a new visitor joining (optional)
            io.in(roomId).emit('user joined', visitor); // Send visitor info (optional)
        
            // Send confirmation to the visitor (optional)
            socket.emit('join room success', { message: `Joined room '${roomId}'` });
            // Send room information to all clients in the room
            const room = await roomservices.getRoomById(roomId);
            io.in(roomId).emit('room info', { room: room[0] });
            // Check if the room has enough players to start the game
            if (existingRoom.visitors.length >= 2) {
              room[0].isGameStarted = true;
              await roomservices.updateRoom(roomId, room[0]);
              io.in(roomId).emit('game start', { message: `Game starting in room '${roomId}'` });
            } else {
              io.in(roomId).emit('wait for players', { message: `Waiting for more players in room '${roomId}'` });
            }

            // Start sending room information to clients in the room
            sendRoomInfo(io, roomId);
          } catch (error) {
            socket.emit('join error', { message: 'An error occurred while joining the room' }); // Specific error message
          }
        });

    socket.on("leaveRoom", async (data) => {
      const { roomId } = data;
      try{
       const res = await roomservices.removeVisitorFromRoomwWithSocketId(socket.id)
       socket.emit('leave room success', { message: `Left room` });
       // Broadcast a message to the room about a visitor leaving (optional)
       socket.leave(roomId);

       io.in(roomId).emit('room info', { room: res });
      } catch (error) {
        socket.emit('leave error', { message: 'An error occurred while leaving the room' }); // Specific error message
      }

    })

  
    // Handle disconnect event
    socket.on('disconnect', async () => {
      if (visitor) {
        // Delete visitor when disconnecting (optional, adjust as needed)
        await visitorservices.deleteVisitor(visitor.socketId);
      } else {
        console.log('Unidentified user disconnected');
      }
    });
  });
};