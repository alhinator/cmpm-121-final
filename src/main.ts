import Board from "./board.ts";
import Plant from "./plant.ts";
import Player from "./player.ts";
import Time from "./time.ts";

/**
 * @constant APP_NAME The name of the application displayed in the title and header.
 */
const APP_NAME = "Final Game";

/**
 * @constant TILE_SIZE The size of each tile in the grid.
 */
const TILE_SIZE = 32;

/**
 * @constant GRID_WIDTH The number of tiles horizontally in the grid.
 * @constant GRID_HEIGHT The number of tiles vertically in the grid.
 */
const GRID_WIDTH = 25;
const GRID_HEIGHT = 18;

/**
 * Main game setup and loop.
 */
const main = () => {
    // Setup application container
    const app = document.querySelector<HTMLDivElement>("#app")!;
    document.title = APP_NAME;

    // Add application title
    const title = document.createElement("h1");
    title.textContent = APP_NAME;
    app.appendChild(title);

    // Setup canvas
    const canvas = document.createElement("canvas");
    canvas.width = GRID_WIDTH * TILE_SIZE;  // E.g., 32 * 25 = 800px
    canvas.height = GRID_HEIGHT * TILE_SIZE; // E.g., 32 * 18 = 576px
    canvas.style.border = "1px solid black"; // Add a border for visibility during testing    
    app.appendChild(canvas);
    const context = canvas.getContext("2d")!;

    // Load player avatar
    Player.LoadAvatar();

    // Instantiate the board
    const board = new Board(GRID_WIDTH, GRID_HEIGHT);
    // Assign Plant's reference to board.
    Plant.SetBoard(board);

    // Instantiate the player
    const player = new Player(canvas, board, TILE_SIZE, 5, 5); // Starting at tile (5, 5)

    // Initialize time module
    Time.initialize(app, board);

    // Game loop
    const gameLoop = () => {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the screen
        board.draw(context, TILE_SIZE); // Draw the board
        player.draw(context); // Draw the player sprite on top of the board
        requestAnimationFrame(gameLoop); // Schedule the next frame
    };

    gameLoop();
};

// Start the game
main();
