const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io('http://localhost:3000', {
  extraHeaders: {
      "Access-Control-Allow-Origin": "http://localhost:8080"
  },
  transports: ['websocket']
});

socket.connect();
socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socket.on('init', handleInit);
socket.on('gameState', handleGameState);

const gameScreen = document.getElementById('gameScreen');

let canvas, ctx;

const gameState = {
    player: {
        pos: {
            x: 3, 
            y: 10,
        },
        vel: {
            x: 1,
            y: 0,
        },
        snake: [
            {x: 1, y: 10},
            {x: 2, y: 10},
            {x: 3, y: 10}
        ]
    },
    food: {
        x: 7, 
        y: 7
    },
    gridsize: 20
};

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
}

function keydown(e) { // When ever a key is pressed we send that keyCode to server
    socket.emit('keydown', e.keyCode);
}

init();

function paintGame(state) {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.player, size, SNAKE_COLOUR);
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for (cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(msg) {
    console.log(msg);
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}