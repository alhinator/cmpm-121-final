import Board from "./board.ts";
import Player from "./player.ts";
import Time from "./time.ts";
import StateManager from "./save.ts";

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

function refreshSaveUI(stateMGR: StateManager, container: HTMLDivElement) {
	container.innerHTML = ""; // Clear the container
	Time.update();

	let slots = stateMGR.getSlots();
	slots.forEach((slot) => {
		const btn = document.createElement("button");
		btn.style.display = "block";
		if(slot == stateMGR.getCurrentSlotId()) {
			btn.innerHTML = "Save #" + slot;
			btn.addEventListener("click", () => {
				stateMGR.save();
				refreshSaveUI(stateMGR, container);
			});
		} else {
			btn.innerHTML = "Load #" + slot;
			btn.addEventListener("click", () => {
				stateMGR.loadFrom(slot);
				refreshSaveUI(stateMGR, container);
			});
		}
		container.append(btn);
	});

	const saveBtn = document.createElement("button");
	saveBtn.style.display = "block";
	saveBtn.innerHTML = "New Save";
	saveBtn.addEventListener("click", () => {
		stateMGR.newSave();
		refreshSaveUI(stateMGR, container);
	});
	container.append(saveBtn);
}

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
	canvas.width = GRID_WIDTH * TILE_SIZE; // E.g., 32 * 25 = 800px
	canvas.height = GRID_HEIGHT * TILE_SIZE; // E.g., 32 * 18 = 576px
	canvas.style.border = "1px solid black"; // Add a border for visibility during testing
	app.appendChild(canvas);
	const context = canvas.getContext("2d")!;

	// Load player avatar
	Player.LoadAvatar();

	//Create State Manager
	const StateMGR = new StateManager({ rows: GRID_HEIGHT, cols: GRID_WIDTH });

	// Instantiate the board
	const board = new Board(GRID_WIDTH, GRID_HEIGHT, StateMGR);

	// Instantiate the player
	const player = new Player(canvas, board, TILE_SIZE, 5, 5, StateMGR);

	// Initialize time module
	Time.initialize(app, board, StateMGR);

	if(StateMGR.hasAutosave()) {
		let ans: string | null = null;
		while(ans == null) {
			ans = prompt("Would you like to continue where you left off? [Y/N]");
		}
		if(ans.toLowerCase().trimStart().charAt(0) == "y") {
			StateMGR.loadAutosave();
		}
	}

	// MESSY CODE: REFACTOR LATER
	//create and append the player inventory:
	const inventory = document.createElement("p");
	inventory.innerHTML = "Inventory: Empty";
	app.appendChild(inventory);

	// create and append the win text
	const win = document.createElement("h1");
	win.innerText = "";
	app.appendChild(win);

	let saveContainer = document.createElement("div");
	app.append(saveContainer);
	refreshSaveUI(StateMGR, saveContainer);

	// Game loop
	const gameLoop = () => {
		context.clearRect(0, 0, canvas.width, canvas.height); // Clear the screen
		board.draw(context, TILE_SIZE); // Draw the board
		player.draw(context); // Draw the player sprite on top of the board
		inventory.innerHTML = `Inventory:<br>` + player.requestInventoryContents(); //Request inventory display string.
		if (player.checkWinCon()) {
			win.innerText = "You won!";
		}
		requestAnimationFrame(gameLoop); // Schedule the next frame
	};

	gameLoop();
};

// Start the game
main();
