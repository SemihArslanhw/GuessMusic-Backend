const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // Import for MongoDB connection
const fs = require('fs'); // Import for file system operations

const roomservices = require('./services/roomservices'); // Import room services
const handleRoomJoining = require('./socket/services/room'); // Import room socket services
const initializeSocket = require('./socket/initializeSocket'); // Import socket initialization
const path = require('path');
const { createMusic } = require('./services/musicservices');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/guessmusicapp', {})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.use('/musics', express.static(path.join(__dirname, '/musics')))

const createRoomsFromMusicFolder = async () => {
  try {
      const musicFolderPath = path.join(__dirname, './musics');
      // Read the contents of the music folder
      const musicFiles = fs.readdirSync(musicFolderPath);
      
      for (const file of musicFiles) {
          // Assuming each subfolder represents a room
          const roomName = file;
          const roomLogo = path.join('musics', file, `${file}.jpeg`); // Assuming logo file is named after the room folder
          
          // Get all music files in the room folder
          const musicFolderPath = path.join(__dirname, './musics', file);

          let allArtists = [];
          await roomservices.getRoomByName(roomName).then((existingRoom) => {
            console.log('existingRoom', existingRoom)
            if (existingRoom.length === 0) {
              console.log('Creating room:', roomName);
              console.log('Logo:', roomLogo);
              roomservices.createRoom({
                   name: roomName,
                   logo: roomLogo,
               }).then(async (existingRoom) => {
                fs.readdirSync(musicFolderPath).map(item => {
                  if (item !== file + ".jpeg") {
                      // Dosya adı ile klasör adı eşleşmiyorsa, bu dosyayı müzikler listesine dahil et
                      const artist = item.split('-')[0].trim();
                      const answer = artist;
                      allArtists.push(artist);
                  }});
                fs.readdirSync(musicFolderPath).map(item => {
                  const fullPath = path.join(musicFolderPath, item);
                  // Dosya mı kontrol et
                  if (!fs.statSync(fullPath).isDirectory()) {      
                      // Dosya adı ile klasör adı eşleşmiyorsa, bu dosyayı müzikler listesine dahil et
                      if(item !== file + ".jpeg"){
                        const artist = item.split('-')[0].trim();
                        const answer = artist;
                        let questions = allArtists.filter((item) => item !== artist);
                        questions = questions.slice(0, 3);
                        questions.push(artist);
                        const existingMusic = createMusic({
                            name: item,
                            artist: artist,
                            roomId: existingRoom._id,
                            path: '/musics/' + roomName + '/' + item,
                            questions:  questions,
                            answer: answer,
                                
                        });
                        if (!existingMusic) {
                            console.log('Creating music:', item);
                        } else {
                            console.log('Music already exists:', existingMusic);
                        }
                      }
                  }
            });
               })
           } else {
               console.log('Room already exists:', existingRoom);
               return;
           }
          });

};} catch (error) {
      console.error('Error creating rooms:', error.message);
  }
}

createRoomsFromMusicFolder();

const io = initializeSocket(server); // Initialize socket.io

handleRoomJoining(io); // Handle room joining logic


const port = process.env.PORT || 3003;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
