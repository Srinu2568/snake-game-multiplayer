const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3, 
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10}
            ],
            foodCount: 0
        }, {
            pos: {
                x: 18, 
                y: 10,
            },
            vel: {
                x: 0,
                y: 0,
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10}
            ],
            foodCount: 0 
        }],
        food: {},
        gridsize: GRID_SIZE,
        active: true
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2; // If player 1 goes off the grid/canvas we will return 2 as player 2 wins the game
    }
    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        return 1 ; // If player 2 goes off the grid/canvas we will return 1 as player 1 wins the game
    }

    // Check if player eats the food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({...playerOne.pos}); // Push the current position of the player
        playerOne.pos.x += playerOne.vel.x; // And add velocity
        playerOne.pos.y += playerOne.vel.y;
        playerOne.foodCount += 1 // Increase food count
        randomFood(state); // Food is missing now so we have to place the food in new position 
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push({...playerTwo.pos}); // Push the current position of the player
        playerTwo.pos.x += playerTwo.vel.x; // And add velocity
        playerTwo.pos.y += playerTwo.vel.y;
        playerTwo.foodCount += 1 // Increase food count
        randomFood(state); // Food is missing now so we have to place the food in new position 
    }

    if (playerOne.vel.x || playerOne.vel.y) {
        // checks if snake's head is bumped into any of its own body
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2; // Player 2 wins
            }
        }

        playerOne.snake.push({...playerOne.pos });
        playerOne.snake.shift();
    }

    // Handling body bump for player 2
    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1; // Player 1 wins
            }
        }

        playerTwo.snake.push({...playerTwo.pos });
        playerTwo.snake.shift();
    }

    // First one to collect 10 fruits wins!
    if (playerOne.foodCount === 10) {
        return 1;
    }

    if (playerTwo.foodCount === 10) {
        return 2;
    }

    //No winner until now
    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }
    // Checks if the randomfood is generated on snake body, and prevent it by calling it again
    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    state.food = food
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: { // left
            return { x: -1, y: 0}
        }
        case 38: { // down
            return { x: 0, y: -1}
        }
        case 39: { // right
            return { x: 1, y: 0}
        }
        case 40: { // up
            return { x: 0, y: 1}
        }
    }
}