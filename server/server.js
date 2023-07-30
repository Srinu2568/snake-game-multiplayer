const express = require("express");
const app = express();
const path = require('path');
const http = require("http").createServer(app);
// const io = require('socket.io')(http);
const io = require('socket.io')(http, {
  cors: {
    origin: ["*:*"],
    methods: ["GET", "POST"]
  }, 
  allowEIO3: true
});

const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./util');

const state = {};
const clientRooms = {};

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
})

app.get('/healthz', (req, res) => {
  res.status(200).json({ message: 'Server is up and running' });
});

app.get('/sitemap.xml', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../sitemap.xml'))
})

// On connection we get back a socket (we named it as client here)
io.on('connection', client => {

    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
      // const room = io.sockets.adapter.rooms[roomName];
      const room = io.sockets.adapter.rooms.get(roomName);
      // console.log(io.sockets.adapter.rooms);
      let allUsers;
      if (room) {
        // allUsers = room.sockets;
        allUsers = [];
        for (i of room) {
          allUsers.push(i);
        }
      }

      let numClients = 0;
      if (allUsers) {
        // numClients = Object.keys(allUsers).length;
        numClients = allUsers.length;
      }

      if (numClients === 0) {
        client.emit('unknownGame');
        return;
      } else if (numClients > 1) {
        client.emit('tooManyPlayers');
        return;
      }

      clientRooms[client.id] = roomName;
      client.emit('gameCode', roomName);

      client.join(roomName);
      client.number = 2;
      client.emit('init', 2);

      startGameInterval(roomName);
    }

    function handleNewGame() {
      let roomName = makeid(5);
      clientRooms[client.id] = roomName;
      client.emit('gameCode', roomName);

      state[roomName] = initGame();

      client.join(roomName);
      client.number = 1;
      client.emit('init', 1);

    }

    function handleKeydown(keyCode) {
      const roomName = clientRooms[client.id];

      if (!roomName) {
        return;
      }

      try {
        keyCode = parseInt(keyCode)
      } catch(e) {
        console.log(err);
        return
      }

      const vel = getUpdatedVelocity(keyCode);

      if (vel && state.length !== 0) { // Update velocity of players based on current player
        try {
          if (state[roomName].players[client.number - 1].vel.x === 1 && vel.x === -1){
          //pass 
          }
          else if (state[roomName].players[client.number - 1].vel.x === -1 && vel.x === 1) {
            //pass
          } 
          else if (state[roomName].players[client.number - 1].vel.y === 1 && vel.y === -1) {
            //pass
          } 
          else if (state[roomName].players[client.number - 1].vel.y === -1 && vel.y === 1) {
            //pass
          } 
          else {
            try {
              state[roomName].players[client.number - 1].vel = vel;      
            } catch(err) {
              // console.log(err); //pass
              //pass
              // return;
            }
          }
        } catch(err) {
          // console.log(err); //pass
          //pass
        }
      }
    }
});

// On connection start the game interval which checks for the winner at certain interval of time
function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);

        // Gameloop returns if there is a winner or not
        if (!winner) { // if there is no winner we continue to send the game state to the client
          emitGameState(roomName, state[roomName]);
        } else { // if we get a winner we emit a gameOver event to client  
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId); // and clear the interval so it stops checking for the winner as game is over.
        }
    }, 1000 / FRAME_RATE); // No. of milli seconds to wait b/w each frame (here 100 ms) // More the frame rate, the more smooth the game will be
}

function emitGameState(roomName, state) {
  io.sockets.in(roomName)
    .emit('gameState', JSON.stringify(state));
}

function emitGameOver(roomName, winner) {
  io.sockets.in(roomName)
    .emit('gameOver', JSON.stringify({ winner }));
  console.log(`Player ${winner} of the Room '${roomName}' Wins!`)
}

const port = 3000;
try {
  http.listen(port, () => {
    console.log("listening on localhost:" + port);
  });
} catch (e) {
  console.error("Server failed to listen " + e);
}
