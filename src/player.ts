import Board from "./board";
import Plant, { NO_PLANT } from "./plant";
import StateManager, { floatSize } from "./save";
import avatarPath from "./assets/playerAvatar.png";
import { translation } from "./i18n";

/**
 * @class Represents the player character in the game.
 */
export default class Player {
	
	private avatar?: Phaser.GameObjects.Sprite;

	private readonly board: Board;
	private StateMGR: StateManager;

	private isMoving: boolean = false;
	private currentPlant: number = NO_PLANT;

	/**
	 * @param canvas The canvas element on which the player will be drawn.
	 * @param initialX The starting X-coordinate (in tiles) of the player.
	 * @param initialY The starting Y-coordinate (in tiles) of the player.
	 * @param mgr The state manager to store this player's data.
	 * @function Constructs a new Player instance and initializes its position.
	 */
	constructor(board: Board, tileSize: number, initialX: number, initialY: number, mgr: StateManager) {
		this.board = board;
		this.StateMGR = mgr;
		this.tileSize = tileSize;
		this.x = initialX * tileSize;
		this.y = initialY * tileSize;
		this.setupKeyboardListeners();

		this.crops = new Map<number, number>();
		this.initInventory();
	}

	// -------- Property Getters/Setters --------
	/**
	 * Get the current X-coordinate of the player in pixels.
	 */
	public get x(): number {
		const bv = this.StateMGR.player;
		return bv.getFloat64(0);
	}
	/**
	 * Set the current X-coordinate of the player in pixels.
	 */
	public set x(value: number) {
		const bv = this.StateMGR.player;
		bv.setFloat64(0, value);
	}
	/**
	 * Get the current Y-coordinate of the player in pixels.
	 */
	public get y(): number {
		const bv = this.StateMGR.player;
		return bv.getFloat64(8);
	}
	/**
	 * Set the current X-coordinate of the player in pixels.
	 */
	public set y(value: number) {
		const bv = this.StateMGR.player;
		bv.setFloat64(8, value);
	}
	/**
	 * Sets the player's reference for tile size.
	 */
	public set tileSize(value: number) {
		const bv = this.StateMGR.player;
		bv.setFloat64(16, value);
	}
	/**
	 * Get the player's reference for tile size.
	 */
	public get tileSize(): number {
		const bv = this.StateMGR.player;
		return bv.getFloat64(16);
	}
	/**
	 * Get the player's currently held seeds.
	 */
	public get seeds(): Map<number, number> {
		const bv = this.StateMGR.player;
		const MainOffset = 24;
		const mapped = new Map<number, number>();
		for (let i = 0; i < Plant.numPlants; i++) {
			let miniOffset = i * floatSize * 2;
			const kp = { key: bv.getFloat64(MainOffset + miniOffset), value: bv.getFloat64(MainOffset + miniOffset + floatSize) };
			if (kp.key != NO_PLANT) {
				mapped.set(kp.key, kp.value);
			}
		}
		return mapped;
	}
	/**
	 * Set the player's currently held seeds.
	 */
	public set seeds(seeds: Map<number, number>) {
		const bv = this.StateMGR.player;
		const MainOffset = 24;
		const pairs = Array.from(seeds, ([key, value]) => ({ key, value }));
		for (let i = 0; i < Plant.numPlants; i++) {
			const miniOffset = i * floatSize * 2;
			if (i < seeds.size) {
				bv.setFloat64(MainOffset + miniOffset, pairs[i].key);
				bv.setFloat64(MainOffset + miniOffset + floatSize, pairs[i].value);
			} else {
				bv.setFloat64(MainOffset + miniOffset, NO_PLANT);
				bv.setFloat64(MainOffset + miniOffset + floatSize, 0);
			}
		}
	}
	/**
	 * Get the player's currently held crops.
	 */
	public get crops(): Map<number, number> {
		const bv = this.StateMGR.player;
		const MainOffset = 24 + Plant.numPlants * 2 * floatSize;
		const mapped = new Map<number, number>();
		for (let i = 0; i < Plant.numPlants; i++) {
			const miniOffset = i * floatSize * 2;
			const kp = { key: bv.getFloat64(MainOffset + miniOffset), value: bv.getFloat64(MainOffset + miniOffset + floatSize) };
			if (kp.key != NO_PLANT) {
				mapped.set(kp.key, kp.value);
			}
		}
		return mapped;
	}
	/**
	 * Set the player's currently held seeds.
	 */
	public set crops(crops: Map<number, number>) {
		const bv = this.StateMGR.player;
		const MainOffset = 24 + Plant.numPlants * 2 * floatSize;
		const pairs = Array.from(crops, ([key, value]) => ({ key, value }));
		for (let i = 0; i < Plant.numPlants; i++) {
			const miniOffset = i * floatSize * 2;
			if (i < crops.size) {
				bv.setFloat64(MainOffset + miniOffset, pairs[i].key);
				bv.setFloat64(MainOffset + miniOffset + floatSize, pairs[i].value);
			} else {
				bv.setFloat64(MainOffset + miniOffset, NO_PLANT);
				bv.setFloat64(MainOffset + miniOffset + floatSize, 0);
			}
		}
	}

	// ---------- Public functions ------------

	/**
	 * Preloads the player avatar.
	 * @param scene The scene to preload the avatar in.
	 */
	public preload(scene: Phaser.Scene) {
		scene.load.image("avatar", avatarPath);
	}

	/**
	 * Creates the sprite that represents the player.
	 * @param scene The scene to create the player sprite in.
	 */
	public create(scene: Phaser.Scene) {
		this.avatar = scene.add.sprite(this.x + this.tileSize / 2, this.y + this.tileSize / 2, "avatar");
		this.avatar.setScale(1 / this.tileSize);
	}

	/**
	 * Updates the sprite representing the player
	 */
	public updateSprite(): void {
		this.avatar?.setPosition(this.x + this.tileSize / 2, this.y + this.tileSize / 2);
	}

	/**
	 * Moves the player character by a number of tiles in a specified direction, constrained by the canvas dimensions.
	 * @param deltaX The number of tiles to move in the X direction.
	 * @param deltaY The number of tiles to move in the Y direction.
	 */
	private move(deltaX: number, deltaY: number): void {
		const newX = this.x + deltaX * this.tileSize;
		const newY = this.y + deltaY * this.tileSize;

		// Constrain movement to the canvas bounds
		// if (newX >= 0 && newX < this.canvas.width && newY >= 0 && newY < this.canvas.height) {
			this.x = newX;
			this.y = newY;
		// }
	}

	/**
	 * Sets up keyboard listeners for player movement using WASD or arrow keys.
	 * Prevents continuous movement by toggling `isMoving`.
	 */
	private setupKeyboardListeners(): void {
		window.addEventListener("keydown", (event) => {
			if (this.isMoving) return;

			switch (event.key) {
				case "ArrowUp":
				case "w":
					this.move(0, -1);
					break;
				case "ArrowDown":
				case "s":
					this.move(0, 1);
					break;
				case "ArrowLeft":
				case "a":
					this.move(-1, 0);
					break;
				case "ArrowRight":
				case "d":
					this.move(1, 0);
					break;
				case "x":
					this.attemptToSow();
					break;
				case "z":
					this.attemptToReap();
					break;
				case "c":
					this.cycleSeeds();
					break;
			}

			this.isMoving = true;
		});

		window.addEventListener("keyup", () => {
			this.isMoving = false;
		});
	}

	private initInventory() {
		const tempSeed = this.StateMGR.startSeedData;
		this.seeds = tempSeed;

		const tempCrops = new Map<number,number>();
		this.crops = tempCrops;
		this.currentPlant = 0;
	}
	private attemptToSow() {
		const tempSeeds = this.seeds;
		const currSeeds = tempSeeds.get(this.currentPlant);
		if (currSeeds && currSeeds > 0) {
			const success = this.board.Sow(
				{
					row: Math.round(this.y / this.tileSize) + 1,
					col: Math.round(this.x / this.tileSize),
				},
				this.currentPlant
			);
			if (success) {
				tempSeeds.set(this.currentPlant, currSeeds - 1);
				this.seeds = tempSeeds;
			}
		}
	}
	private attemptToReap() {
		const reward = this.board.Reap({
			row: Math.round(this.y / this.tileSize) + 1,
			col: Math.round(this.x / this.tileSize),
		});
		if (reward) {
			reward.forEach((r: string) => {
				if (r.toString().includes("Seed")) {
					const val = parseInt(r.slice(0, -4));
					const currSeeds: number = this.seeds.get(val) ? this.seeds.get(val)! : 0;
					const tmp = this.seeds;
					tmp.set(val, currSeeds + 1);
					this.seeds = tmp;
				} else {
					const currPlants = this.crops.get(parseInt(r)) ? this.crops.get(parseInt(r))! : 0;
					const tmp = this.crops;
					tmp.set(parseInt(r), currPlants + 1);
					this.crops = tmp;
				}
			});
		}
	}
	private cycleSeeds() {
		let next = false;
		let found = false;
		this.seeds.forEach((_value: number, key: number) => {
			if (!found) {
				if (next) {
					this.currentPlant = key;
					found = true;
					return;
				}
				if (key == this.currentPlant) {
					next = true;
					return;
				}
			}
		});
		if (!found) {
			this.currentPlant = Array.from(this.seeds.keys())[0];
		}
	}
	public requestInventoryContents(): string {
		let retVal = translation("inventory_seeds") + `: <br>`;
		const tmpSeeds = this.seeds;
		tmpSeeds.forEach((val, key) => {
			if(this.currentPlant == key){retVal+=`<strong>`}
			retVal += `&ensp;${Plant.displayName(key)}: ${val}<br>`;
			if(this.currentPlant == key){retVal+=`</strong>`}
		});
		retVal += translation("inventory_crops") + ":<br>";
		this.crops.forEach((val, key) => {
			retVal += `&ensp;${Plant.displayName(key)}: ${val}<br>`;
		});

		return retVal;
	}
	public checkWinCon(): boolean {
		//MESSY
		const wh = this.crops.get(0);
		const co = this.crops.get(1);
		const ri = this.crops.get(2);
		const win = StateManager.SeedsToWin
		if (wh && wh >= win && co && co >= win && ri && ri >= win) {
			return true;
		}
		return false;
	}
}
