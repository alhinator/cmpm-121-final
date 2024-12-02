import Board from "./board.ts";
import Player from "./player.ts";
import Time from "./time.ts";
import StateManager from "./save.ts";
import Phaser from "phaser";


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

class MainScene extends Phaser.Scene {
	readonly StateMGR: StateManager = new StateManager({ rows: GRID_HEIGHT, cols: GRID_WIDTH });
	readonly board = new Board(GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, this.StateMGR);
	readonly player = new Player(this.board, TILE_SIZE, 5, 5, this.StateMGR);
	
	inventory?: HTMLParagraphElement;
	win?: HTMLHeadingElement;

	refreshSaveUI(container: HTMLDivElement) {
		container.innerHTML = ""; // Clear the container
		Time.update();

		let slots = this.StateMGR.getSlots();
		slots.forEach((slot) => {
			const btn = document.createElement("button");
			btn.style.display = "block";
			if(slot == this.StateMGR.getCurrentSlotId()) {
				btn.innerHTML = "Save #" + slot;
				btn.addEventListener("click", () => {
					this.StateMGR.save();
					this.refreshSaveUI(container);
				});
			} else {
				btn.innerHTML = "Load #" + slot;
				btn.addEventListener("click", () => {
					this.StateMGR.loadFrom(slot);
					this.refreshSaveUI(container);
				});
			}
			container.append(btn);
		});

		const saveBtn = document.createElement("button");
		saveBtn.style.display = "block";
		saveBtn.innerHTML = "New Save";
		saveBtn.addEventListener("click", () => {
			this.StateMGR.newSave();
			this.refreshSaveUI(container);
		});
		container.append(saveBtn);
	}

	preload() {
		this.player.preload(this);
	}

	create() {
		this.board.create(this);
		this.player.create(this);

		let uiRoot = document.createElement("div");
		document.body.append(uiRoot);

		Time.initialize(uiRoot, this.board, this.StateMGR);

		if(this.StateMGR.hasAutosave()) {
			let ans: string | null = null;
			while(ans == null) {
				ans = prompt("Would you like to continue where you left off? [Y/N]");
			}
			if(ans.toLowerCase().trimStart().charAt(0) == "y") {
				this.StateMGR.loadAutosave();
			}
		}

		// MESSY CODE: REFACTOR LATER
		//create and append the player inventory:
		this.inventory = document.createElement("p");
		this.inventory.innerHTML = "Inventory: Empty";
		uiRoot.appendChild(this.inventory);

		// create and append the win text
		this.win = document.createElement("h1");
		this.win.innerText = "";
		uiRoot.appendChild(this.win);

		let saveContainer = document.createElement("div");
		uiRoot.append(saveContainer);
		this.refreshSaveUI(saveContainer);
	}

	update(): void {
		this.board.updateSprites();
		this.player.updateSprite();

		this.inventory!.innerHTML = `Inventory:<br>` + this.player.requestInventoryContents(); //Request inventory display string.
		if (this.player.checkWinCon()) {
			this.win!.innerText = "You won!";
		}
	}
}

const main = () => {
	// Add application title
	document.title = APP_NAME;
	const title = document.createElement("h1");
	title.textContent = APP_NAME;
	document.body.appendChild(title);

	// Run the main scene
	new Phaser.Game({
		width: TILE_SIZE * GRID_WIDTH,
		height: TILE_SIZE * GRID_HEIGHT,
		scene: MainScene
	});
}

// Start the game
main();
