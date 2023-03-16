const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

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

function keydown(e) {
    console.log(e.keyCode);
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

paintGame(gameState);