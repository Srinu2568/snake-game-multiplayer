const express = require("express");
const app = express();
const http = require("http").createServer(app);
// const io = require('socket.io')(http);
const io = require('socket.io')(http, {
  cors: {
    origin: ["http://localhost:8080"],
    methods: ["GET", "POST"]
  }
});

const { createGameState, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');

// On connection we get back a socket (we named it as client here)
io.on('connection', client => {
    const state = createGameState();

    client.on('keydown', handleKeydown);

    function handleKeydown(keyCode) {
      try {
        keyCode = parseInt(keyCode)
      } catch(e) {
        console.log(err);
        return
      }

      const vel = getUpdatedVelocity(keyCode);

      if (vel) {
        state.player.vel = vel;
      }
    }

    startGameInterval(client, state);
});

// On connection start the game interval which checks for the winner at certain interval of time
function startGameInterval(client, state) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state);

        // Gameloop returns if there is a winner or not
        if (!winner) { // if there is no winner we continue to send the game state to the client
            client.emit('gameState', JSON.stringify(state));
        } else { // if we get a winner we emit a gameOver event to client  
            client.emit('gameOver');
            clearInterval(intervalId); // and clear the interval so it stops checking for the winner as game is over.
        }
    }, 1000 / FRAME_RATE); // No. of milli seconds to wait b/w each frame (here 100 ms) // More the frame rate, the more smooth the game will be
}

const port = process.env.PORT || 3000;
try {
  http.listen(port, () => {
    console.log("listening on localhost:" + port);
  });
} catch (e) {
  console.error("Server failed to listen " + e);
}
