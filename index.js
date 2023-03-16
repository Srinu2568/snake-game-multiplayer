const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const gameScreen = document.getElementById('gameScreen');

let canvas, ctx;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillystyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
}

function keydown(e) {
    console.log(e.keycode);
}

init();