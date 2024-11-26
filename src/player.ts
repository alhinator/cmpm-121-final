import Board from "./board";
import Plant, { NO_PLANT } from "./plant";

/**
 * @class Represents the player character in the game.
 */
export default class Player {
	private static readonly avatarPath: string = "/assets/playerAvatar.png";
	private static avatar: HTMLImageElement | null = null;

	private readonly canvas: HTMLCanvasElement;
	private readonly tileSize: number;
	private readonly board: Board;
	private x: number;
	private y: number;
	private isMoving: boolean = false;
	private currentPlant: number = NO_PLANT;
	private seeds: Map<number, number>;
	private grownPlants: Map<number, number>;

	/**
	 * @function Loads the player avatar image. Must be called before creating any Player instances.
	 */
	public static LoadAvatar(): void {
		if (!Player.avatar) {
			Player.avatar = new Image();
			Player.avatar.src = Player.avatarPath;
		}
	}

	/**
	 * @param canvas The canvas element on which the player will be drawn.
	 * @param initialX The starting X-coordinate (in tiles) of the player.
	 * @param initialY The starting Y-coordinate (in tiles) of the player.
	 * @function Constructs a new Player instance and initializes its position.
	 */
	constructor(canvas: HTMLCanvasElement, board: Board, tileSize: number, initialX: number, initialY: number) {
		if (!Player.avatar) {
			throw new Error("Player: Avatar image not loaded. Call Player.LoadAvatar() first.");
		}
		this.canvas = canvas;
		this.board = board;
		this.tileSize = tileSize;
		this.x = initialX * tileSize;
		this.y = initialY * tileSize;
		this.setupKeyboardListeners();

		this.seeds = new Map<number, number>();
		this.grownPlants = new Map<number, number>();
		this.initInventory();
	}

	// -------- Property Getters --------
	/**
	 * Get the current X-coordinate of the player in pixels.
	 */
	public get positionX(): number {
		return this.x;
	}

	/**
	 * Get the current Y-coordinate of the player in pixels.
	 */
	public get positionY(): number {
		return this.y;
	}

	/**
	 * Draws the player avatar at the current position on the canvas.
	 */
	public draw(context: CanvasRenderingContext2D): void {
		//this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear previous frame
		context.drawImage(Player.avatar!, this.x, this.y, this.tileSize, this.tileSize);
	}

	/**
	 * Moves the player character by one tile in a specified direction, constrained by the canvas dimensions.
	 * @param deltaX The number of tiles to move in the X direction.
	 * @param deltaY The number of tiles to move in the Y direction.
	 */
	private move(deltaX: number, deltaY: number): void {
		const newX = this.x + deltaX * this.tileSize;
		const newY = this.y + deltaY * this.tileSize;

		// Constrain movement to the canvas bounds
		if (newX >= 0 && newX < this.canvas.width && newY >= 0 && newY < this.canvas.height) {
			this.x = newX;
			this.y = newY;
		}
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
		this.seeds.set(0, 3);
		this.seeds.set(1, 3);
		this.seeds.set(2, 3);
		this.currentPlant = 0;
	}
	private attemptToSow() {
		const currSeeds = this.seeds.get(this.currentPlant);
		if (currSeeds && currSeeds > 0) {
			const success = this.board.Sow(
				{
					row: Math.round(this.y / this.tileSize) + 1,
					col: Math.round(this.x / this.tileSize),
				},
				this.currentPlant
			);
			if (success) {
				this.seeds.set(this.currentPlant, currSeeds - 1);
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
					this.seeds.set(val, currSeeds + 1);
				} else {
					const currPlants = this.grownPlants.get(parseInt(r)) ? this.grownPlants.get(parseInt(r))! : 0;
					this.grownPlants.set(parseInt(r), currPlants + 1);
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
		let retVal = `Seeds: <br>`;
		this.seeds.forEach((val, key) => {
			retVal += `&ensp;${Plant.name(key)}: ${val}<br>`;
		});
		retVal += "Crops:<br>";
		this.grownPlants.forEach((val, key) => {
			retVal += `&ensp;${Plant.name(key)}: ${val}<br>`;
		});

		return retVal;
	}
    public checkWinCon():boolean{ //MESSY
        const wh = this.grownPlants.get(0);
        const co = this.grownPlants.get(1);
        const ri = this.grownPlants.get(2);
        if( wh && wh >= 10 && co && co >= 10 && ri && ri >=10){
            return true;
        }
        return false;
    }
}
