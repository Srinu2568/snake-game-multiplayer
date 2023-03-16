const { GRID_SIZE } = require('./constants');

module.exports = {
    createGameState,
    gameLoop,
    getUpdatedVelocity,
}

function createGameState() {
    return {
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
        gridsize: GRID_SIZE,
        active: true
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.player;

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2; // If player 1 goes off the grid/canvas we will return 2 as player 2 wins the game
    }

    // Check if player eats the food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({...playerOne.pos}); // Push the current position of the player
        playerOne.pos.x += playerOne.vel.x; // And add velocity
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state); // Food is missing now so we have to place the food in new position 
    }

    // checks if snake's head is bumped into any of the body
    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2; // Player 2 wins
            }
        }

        playerOne.snake.push({...playerOne.pos });
        playerOne.snake.shift();
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
    for (let cell of state.player.snake) {
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