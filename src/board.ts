import Plant from "./plant";

/**
 * @enum TILETYPE the basic enum determining the current state of a Tile
 */
export enum TILETYPE {
	EMPTY,
	PLANT,
	WATER,
}
/**
 * @constant MT_TILE is the default character to be used when a tile contains no plant.
 */
const MT_TILE = "_";
/**
 * @constant SUN_RANGE is the rage at which the sun will provide light.
 */
const SUN_RANGE = 6;
/**
 * @constant MAX_HYDRATION is the maximum possible hydration level of a tile.
 */
const MAX_HYDRATION = 4;

const DIRT_COLOR = [89, 52, 30];
const WATER_COLOR = [0, 86, 204];

/**
 * @interface Cell is a [row, column] interface used to access positions on a board.
 */
export interface Cell {
	row: number;
	col: number;
}

/**
 * @interface Tile contains content, sun and water levels, and potential plant data at a [row, col] position.
 */
export interface Tile {
	cell: Cell;
	content: TILETYPE;
	sun: number;
	water: number;
	plant: Plant | null;
}

/**
 * @class Board contains a [row, col] array of Tiles, and the functionality to access and manipulate those tiles.
 */
export default class Board {
	public readonly cols: number;
	public readonly rows: number;
	private board: Tile[][];
	private sunPosition: number = -SUN_RANGE;

	/**
	 * @constructor Initialize an empty board.
	 * @param cols Width of the board to initialize to. Cannot be changed once set.
	 * @param rows Height of the board to initialize to. Cannot be changed once set.
	 */
	constructor(cols: number, rows: number) {
		this.cols = cols;
		this.rows = rows;
		this.board = [];

		this.InitTiles();
		
	}

	// -------- Public class operations --------
	/**
	 *
	 * @returns A paragraph-formatted string with the current displayable character of each tile on the grid.
	 */
	public toString(): string {
		let retStr = "";
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				retStr += this.board[i][j].plant ? this.board[i][j].plant!.displayCharacter : MT_TILE;
			}
			retStr += "\n";
		}
		return retStr;
	}
	/**
	 * Causes the board to move forward one game tick: Moves the sun, hydrates tiles, and gives plants the chance to grow.
	 */
	public Tick() {
		this.MoveSun();
		this.UpdateSunTiles();
		this.Hydrate();
		this.Grow();
	}
	/**
	 * @returns The current columnal position of the sun, between 0 and this Board's cols.
	 */
	public get Sun(): number {
		return this.sunPosition;
	}
	/**
	 * Draws the board.
	 * @param context The rendering context to draw the board to
	 * @param tileSize The size of each tile
	 */
	public draw(context: CanvasRenderingContext2D, tileSize: number): void {
		context.save(); // Save the current drawing state
		context.strokeStyle = "#000000"; // Black color for grid lines
		context.lineWidth = 1; // Thin but visible lines

		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				let tile = this.board[y][x];
				let color: number[] = [0, 0, 0];
				if (tile.content == TILETYPE.EMPTY) {
					let tint_level = tile.water * 0.04;

					color[0] = DIRT_COLOR[0] * (1 - tint_level) + WATER_COLOR[0] * tint_level;
					color[1] = DIRT_COLOR[1] * (1 - tint_level) + WATER_COLOR[1] * tint_level;
					color[2] = DIRT_COLOR[2] * (1 - tint_level) + WATER_COLOR[2] * tint_level;
				} else {
					color[0] = WATER_COLOR[0];
					color[1] = WATER_COLOR[1];
					color[2] = WATER_COLOR[2];
				}
				color[0] *= Math.max(0.5, tile.sun);
				color[1] *= Math.max(0.5, tile.sun);
				color[2] *= Math.max(0.5, tile.sun);
				context.fillStyle = `rgb(${Math.floor(color[0])}, ${Math.floor(color[1])}, ${Math.floor(color[2])})`;
				context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			}
		}

		// Draw vertical grid lines
		for (let x = 0; x <= this.cols * tileSize; x += tileSize) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, this.rows * tileSize);
			context.stroke();
		}

		// Draw horizontal grid lines
		for (let y = 0; y <= this.rows * tileSize; y += tileSize) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(this.cols * tileSize, y);
			context.stroke();
		}

		context.restore(); // Restore the drawing state
	}

	// -------- Public single-tile operations --------
	/**
	 *
	 * @param cell The [row, col] position at which to get Tile data.
	 * @returns the Tile data for that position.
	 */
	public GetTile(cell: Cell): Tile | null {
		if (cell.row >= this.rows || cell.row < 0 || cell.col >= this.cols || cell.col < 0) {
			return null;
		}
		return this.board[cell.row][cell.col];
	}
	/**
	 *
	 * Converts the specified [row, col] position to a water tile, destroying the plant in that tile if it is there.
	 * @param cell The [row, col] position to turn into a water source.
	 * @returns The success state of the operation.
	 */
	public Irrigate(cell: Cell): boolean {
		const tmp = this.GetTile(cell);
		if (tmp && tmp.content != TILETYPE.WATER) {
			tmp.content = TILETYPE.WATER;
			tmp.plant = null;
			return true;
		}
		return false;
	}
	/**
	 * Removes an amount of water from the specified [row, col] position's tile.
	 * @param cell The [row, col] position to remove water from.
	 */
	public Dehydrate(cell: Cell, amount: number) {
		const tmp = this.GetTile(cell);
		if (tmp) {
			tmp.water > amount ? (tmp.water -= amount) : (tmp.water = 0);
		}
	}
	/**
	 * Removes any water or plants from the specified [row, col] position, turning it into an empty tile.
	 * @param cell The [row, col] position to till.
	 * @returns The success state of the operation.
	 */
	public Till(cell: Cell): boolean {
		const tmp = this.GetTile(cell);
		if (tmp && tmp.content != TILETYPE.EMPTY) {
			tmp.content = TILETYPE.EMPTY;
			tmp.plant = null;
			return true;
		}
		return false;
	}
	/**
	 * Attempts to plant a seed in the specified [row, col] position. Fails if the specified tile is a Water tile or already has a plant there.
	 * @param cell The [row, col] position to attempt to plant in.
	 * @param name The name of the plant as specified in the PlantData.json file.
	 * @returns The success state of the operation.
	 */
	public Sow(cell: Cell, name: string) {
		const tmp = this.GetTile(cell);
		if (tmp && tmp.content == TILETYPE.EMPTY) {
			tmp.content = TILETYPE.PLANT;
			tmp.plant = new Plant(name, cell);
			return true;
		}
		return false;
	}
	/**
	 *
	 * @param cell The [row, col] position at which to get adjacency data.
	 * @returns An array of Tiles that are adjacent to the specified [row, col] position.
	 */
	public GetAdjacentTiles(cell: Cell): Tile[] {
		const retVal: Tile[] = [];
		for (let c = cell.col - 1; c < cell.col + 1; c++) {
			for (let r = cell.row - 1; r < cell.row + 1; r++) {
				if (c < 0 || r < 0 || c >= this.cols || r >= this.rows || (c == cell.col && r == cell.row)) {
					continue;
				} else {
					const tmp = this.GetTile({ col: c, row: r });
					if (tmp) {
						retVal.push(tmp);
					}
				}
			}
		}
		return retVal;
	}
	/**
	 *
	 * @param cell The [row, col] position at which to get adjacency data.
	 * @returns A string array of names of the plants adjacent to a given [row, col] position, excluding the given tile or tiles without plants. If no adjacent tiles have plants, returns null.
	 */
	public GetAdjacentPlants(cell: Cell): string[] | null {
		const retVal: string[] = [];
		const adj = this.GetAdjacentTiles(cell);
		adj.forEach((tile) => {
			if (tile.plant) {
				retVal.push(tile.plant.name);
			}
		});
		return retVal.length > 0 ? retVal : null;
	}

	// -------- Private helper funcions --------
	/**
	 * Initializes the tiles when creating the board to either an empty or a water tile.
	 */
	private InitTiles(){
		for (let i = 0; i < this.rows; i++) {
			const tmp: Tile[] = [];
			for (let j = 0; j < this.cols; j++) {
				const state = Math.random() < 0.1 ? TILETYPE.WATER : TILETYPE.EMPTY
				tmp.push({
					cell: { row: i, col: j },
					content: state,
					sun: 0,
					water: 0,
					plant: null,
				});
			}
			this.board.push(tmp);
		}
	}
	/**
	 * Moves the sun from right to left over the board.
	 */
	private MoveSun() {
		this.sunPosition--;
		this.sunPosition < -SUN_RANGE ? (this.sunPosition = this.cols - 1 + SUN_RANGE) : this.sunPosition;
	}
	/**
	 * Sets the sunlight value of all tiles within the sun's range to 1 + Random(0, distance from sun]
	 */
	private UpdateSunTiles() {
		//The sun shines light on vertical strips of tiles, centered on the column of the current sun position.
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				if (col < 0 || col >= this.cols) {
					continue;
				}

				const distance = Math.abs(col - this.Sun);
				const lightLevel = distance < SUN_RANGE ? 1 + (Math.random()*0.1) * Math.max(0, SUN_RANGE - distance) : 0;
				this.GetTile({ row: row, col: col })!.sun = lightLevel;
			}
		}
	}
	/**
	 * Hydrates tiles next to water sources. Increases their hydration by 1 + Random(0, 1]. Hydration per tile is capped at MAX_HYDRATION.
	 */
	private Hydrate() {
		const waterTiles: Tile[] = [];
		this.board.forEach((row) => {
			row.forEach((tile) => {
				if (tile.content == TILETYPE.WATER) {
					waterTiles.push(tile);
				}
			});
		});
		waterTiles.forEach((waterTile) => {
			const adjs = this.GetAdjacentTiles(waterTile.cell);
			adjs.forEach((neighbor) => {
				neighbor.water += 1 + Math.random();
				if (neighbor.water > MAX_HYDRATION) {
					neighbor.water = MAX_HYDRATION;
				}
			});
		});
	}
	/**
	 * Tells all plants to attempt to grow via their tick methods.
	 */
	private Grow() {
		this.board.forEach((row) => {
			row.forEach((tile) => {
				tile.plant?.tick();
			});
		});
	}
}
