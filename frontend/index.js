const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#6cbb3c';
const FOOD_COLOUR = '#e66916';

const socket = io({
  transports: ['websocket']
});

socket.connect();
socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

// Socket Events
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handlegameCode);
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameButton = document.getElementById('newGameButton');
const joinGameButton = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const foodCount1Selector = document.getElementById('foodCount1');
const foodCount2Selector = document.getElementById('foodCount2');
const wait = document.getElementById('wait');
const score = document.getElementById('score');


newGameButton.addEventListener('click', newGame);
joinGameButton.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}
// Globals
let canvas, ctx;
let playerNumber;
let gameActive = false;
let prevFoodCount1 = 0;
let prevFoodCount2 = 0;


function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) { // When ever a key is pressed we send that keyCode to server
    socket.emit('keydown', e.keyCode);
}

let prev_state;

function paintGame(state) {
    // ctx.fillStyle = BG_COLOUR;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let backdrop = new Image();
    backdrop.src = './assets/backdrop.png';
    ctx.drawImage(backdrop, 0, 0, canvas.width, canvas.height);
    
    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    // ctx.fillStyle = FOOD_COLOUR;
    // ctx.fillRect(food.x * size, food.y * size, size, size);

    tileimage = loadImages(["./assets/apple.png"])[0];

    if (prev_state !== state.food) {
        prev_state = state.food;
        ctx.drawImage(tileimage, food.x*size, food.y*size, size, size);
    }    

    paintPlayer(state.players[0], size, 'blue');
    paintPlayer(state.players[1], size, 'yellow');
}

function loadImages(imagefiles) {
    // Initialize variables
    loadcount = 0;
    loadtotal = imagefiles.length;
    preloaded = false;
    
    // Load the images
    var loadedimages = [];
    for (var i=0; i<imagefiles.length; i++) {
        // Create the image object
        var image = new Image();
        
        // Add onload event handler
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                // Done loading
                preloaded = true;
            }
        };
        
        // Set the source url of the image
        image.src = imagefiles[i];
        
        // Save to the image array
        loadedimages[i] = image;
    }
    
    // Return an array of images
    return loadedimages;
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;
    // Load images
    if (colour === 'blue') {
        images = loadImages(["./assets/snake-graphics.png"]);
    }
    else if (colour === 'yellow') {
        images = loadImages(["./assets/enemy-snake-graphics.png"]);
    }
    tileimage = images[0];
    // ctx.fillStyle = colour;
    // for (cell of snake) {
    //     ctx.fillRect(cell.x * size, cell.y * size, size, size);
    // }

    // Loop over every snake segment
    for (var i=0; i<snake.length; i++) {
        var segment = snake[i];
        var segx = segment.x;
        var segy = segment.y;
        var tilex = segx*size;
        var tiley = segy*size;
        
        // Sprite column and row that gets calculated
        var tx = 0;
        var ty = 0;
        
        if (i == 0) {
            // Head; Determine the correct image
            var nseg = snake[i+1]; // Next segment
            if (segy < nseg.y) {
                // Up
                tx = 4; ty = 3;
            } else if (segx > nseg.x) {
                // Right
                tx = 3; ty = 3;
            } else if (segy > nseg.y) {
                // Down
                tx = 3; ty = 2;
            } else if (segx < nseg.x) {
                // Left
                tx = 4; ty = 2;
            }
        } else if (i == snake.length-1) {
            // Tail; Determine the correct image
            var pseg = snake[i-1]; // Prev segment
            if (pseg.y < segy) {
                // Up
                tx = 4; ty = 1;
            } else if (pseg.x > segx) {
                // Right
                tx = 3; ty = 1;
            } else if (pseg.y > segy) {
                // Down
                tx = 3; ty = 0;
            } else if (pseg.x < segx) {
                // Left
                tx = 4; ty = 0;
            }
        } else {
            // Body; Determine the correct image
            var pseg = snake[i-1]; // Previous segment
            var nseg = snake[i+1]; // Next segment
            if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                // Horizontal Left-Right
                tx = 1; ty = 0;
            } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                // Angle Left-Down
                tx = 2; ty = 0;
            } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                // Vertical Up-Down
                tx = 2; ty = 1;
            } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                // Angle Top-Left
                tx = 2; ty = 2;
            } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                // Angle Right-Up
                tx = 0; ty = 1;
            } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                // Angle Down-Right
                tx = 0; ty = 0;
            }
        }
        
        // Draw the image of the snake part
        ctx.drawImage(tileimage, tx*64, ty*64, 64, 64, tilex, tiley,
                            size, size);
    }
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    wait.style.display = 'none';
    score.style.display = 'block';
    gameState = JSON.parse(gameState);
    // console.log(gameState);
    foodCount1 = gameState.players[0].foodCount
    if (prevFoodCount1 !== foodCount1) {
        foodCount1Selector.innerText = foodCount1.toString();
    }

    foodCount2 = gameState.players[1].foodCount
    if (prevFoodCount2 !== foodCount2) {
        foodCount2Selector.innerText = foodCount2.toString();
    }
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);
    if (data.winner === playerNumber) {
        if(confirm('You Win!')){
            window.location.reload();  
        } else {
            window.location.reload();
        }
    } else {
        if(confirm('You Lose')){
            window.location.reload();  
        } else {
            window.location.reload();
        }
    }
    gameActive = false;
}

function handlegameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownGame() {
    reset();
    if(confirm('Unknown Game Code')){
        window.location.reload();  
    }
}

function handleTooManyPlayers() {
    reset();
    if(confirm('This game is already in progress!')){
        window.location.reload();  
    }
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    gameCodeDisplay.innerText = '';
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    score.style.display = 'none';
}

function toggleInstructions() {
    var instructions = document.querySelector('.instructions-container');
    instructions.classList.toggle('show');
}

function closeInstructions() {
    var instructions = document.querySelector('.instructions-container');
    instructions.classList.remove('show');
}