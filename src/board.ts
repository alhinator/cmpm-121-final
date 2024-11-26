import Plant, { NO_PLANT, GLOBAL_FRIEND_RATE } from "./plant";

/**
 * @enum TILETYPE the basic enum determining the current state of a Tile
 */
export enum TILETYPE {
	EMPTY,
	PLANT,
	WATER,
}
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
const PLANT_COLOR = [30, 171, 0];

/**
 * @interface Cell is a [row, column] interface used to access positions on a board.
 */
export interface Cell {
	row: number;
	col: number;
}
/**
 * @class Tile contains content, sun and water levels, and potential plant data at a [row, col] position.
 */
export class Tile {
	public row: number;
	public col: number;
	public content: number;
	public sun: number;
	public water: number;
	public plant: number;
	public growth: number;
	constructor(data: { cell: Cell; content: TILETYPE; sun: number; water: number; plant: number }) {
		this.row = data.cell.row;
		this.col = data.cell.col;
		this.content = data.content;
		this.sun = data.sun;
		this.water = data.water;
		this.plant = data.plant;
		this.growth = 0;
	}
	//POTENTIAL TODO: setters and getters that trigger a write to the board.
}
/**
 * @constant The size of a Tile data structure, in bytes
 */
const TileDataSize = 448;
/**
 * @constant The size of 1 (one) float64
 */
const sunPosSize = 64;

/**
 * @class Board contains a [row, col] array of Tiles, and the functionality to access and manipulate those tiles.
 */
export default class Board {
	public readonly cols: number;
	public readonly rows: number;
	private board: ArrayBuffer;

	/**
	 * @constructor Initialize an empty board.
	 * @param cols Width of the board to initialize to. Cannot be changed once set.
	 * @param rows Height of the board to initialize to. Cannot be changed once set.
	 */
	constructor(cols: number, rows: number) {
		this.cols = cols;
		this.rows = rows;
		this.board = new ArrayBuffer(cols * rows * TileDataSize + sunPosSize);
		this.Sun = -SUN_RANGE - 1;
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
				const tile = this.GetTile({ row: i, col: j })!;
				const display = Plant.displayCharacter(tile.plant, tile.growth);
				retStr += display;
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
		const MainOffset = this.rows * this.cols * TileDataSize - sunPosSize;
		const bv = new DataView(this.board, MainOffset, sunPosSize);
		return bv.getFloat64(0);
	}
	public set Sun(value: number) {
		const MainOffset = this.rows * this.cols * TileDataSize - sunPosSize;
		const bv = new DataView(this.board, MainOffset, sunPosSize);
		bv.setFloat64(0, value);
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
				let tile = this.GetTile({ row: y, col: x })!;
				let color: number[] = [0, 0, 0];
				if (tile.content == TILETYPE.WATER) {
					color[0] = WATER_COLOR[0];
					color[1] = WATER_COLOR[1];
					color[2] = WATER_COLOR[2];
				} else {
					let tint_level = tile.water * 0.04;
					color[0] = DIRT_COLOR[0] * (1 - tint_level) + WATER_COLOR[0] * tint_level;
					color[1] = DIRT_COLOR[1] * (1 - tint_level) + WATER_COLOR[1] * tint_level;
					color[2] = DIRT_COLOR[2] * (1 - tint_level) + WATER_COLOR[2] * tint_level;
				}
				const brightness = Math.max(0.5, tile.sun);
				color[0] = Math.floor(color[0] * brightness);
				color[1] = Math.floor(color[1] * brightness);
				color[2] = Math.floor(color[2] * brightness);
				context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
				context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

				if (tile.content == TILETYPE.PLANT && tile.plant != NO_PLANT) {
					color[0] = Math.floor(PLANT_COLOR[0] * brightness);
					color[1] = Math.floor(PLANT_COLOR[1] * brightness);
					color[2] = Math.floor(PLANT_COLOR[2] * brightness);
					context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
					context.font = "24px monospace";
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText(Plant.displayCharacter(tile.plant, tile.growth), (x + 0.5) * tileSize, (y + 0.5) * tileSize);
				}
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
	 * With tile information, sets data for a tile in the board byte array. As of right now, this needs to be called after modifying any temporary tile variable.
	 */
	public SetTile(t: Tile) {
		const MainOffset = (t.row * this.cols + t.col) * TileDataSize;

		const bv = new DataView(this.board, MainOffset, TileDataSize);
		bv.setFloat64(0, t.row);
		bv.setFloat64(128, t.col);
		bv.setFloat64(128, t.content);
		bv.setFloat64(192, t.sun);
		bv.setFloat64(256, t.water);
		bv.setFloat64(320, t.plant);
		bv.setFloat64(384, t.growth);
	}
	/**
	 * With postition information, returns data of the board's byte array in Tile form.
	 *
	 * @param cell The [row, col] position at which to get Tile data.
	 * @returns the Tile data for that position.
	 */
	public GetTile(cell: Cell): Tile | null {
		if (cell.row >= this.rows || cell.row < 0 || cell.col >= this.cols || cell.col < 0) {
			return null;
		}
		const MainOffset = (cell.row * this.cols + cell.col) * TileDataSize;

		const bv = new DataView(this.board, MainOffset, TileDataSize);
		const tmpContent = bv.getFloat64(128);
		const tmpSun = bv.getFloat64(192);
		const tmpWater = bv.getFloat64(256);
		const tmpPlant = bv.getFloat64(320);
		const tmpGrowth = bv.getFloat64(384);

		return { row: cell.row, col: cell.col, content: tmpContent, sun: tmpSun, water: tmpWater, plant: tmpPlant, growth: tmpGrowth };
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
			tmp.plant = -1;
			this.SetTile(tmp);
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
			tmp.plant = NO_PLANT;
			tmp.growth = 0;
			this.SetTile(tmp);
			return true;
		}
		return false;
	}
	/**
	 * If the specified [row, col] position has a fully grown plant, removes it.
	 * @param cell The [row, col] position to attempt a reap.
	 * @returns If a plant was reaped, returns the reward. If no plant was reaped, returns false.
	 */
	public Reap(cell: Cell): string[] | false {
		const tmp = this.GetTile(cell);
		if (tmp && tmp.plant != NO_PLANT && tmp.growth == Plant.growthCap(tmp.plant)) {
			let retVal = Plant.reward(tmp.plant);
			this.Till(cell);
			return retVal;
		} else {
			return false;
		}
	}
	/**
	 * Attempts to plant a seed in the specified [row, col] position. Fails if the specified tile is a Water tile or already has a plant there.
	 * @param cell The [row, col] position to attempt to plant in.
	 * @param name The name of the plant as specified in the PlantData.json file.
	 * @returns The success state of the operation.
	 */
	public Sow(cell: Cell, id: number) {
		const tmp = this.GetTile(cell);
		console.log("in sow");
		if (tmp && tmp.content == TILETYPE.EMPTY) {
			tmp.content = TILETYPE.PLANT;
			tmp.plant = id;
			tmp.growth = 0;
			this.SetTile(tmp);
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
		for (let c = cell.col - 1; c <= cell.col + 1; c++) {
			for (let r = cell.row - 1; r <= cell.row + 1; r++) {
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
				retVal.push(Plant.name(tile.plant));
			}
		});
		return retVal.length > 0 ? retVal : null;
	}

	// -------- Private helper funcions --------
	/**
	 *
	 * @returns A 1-D array of Tiles that comprise the entire board.
	 */
	private GetAllTiles(): Tile[] {
		const ts: Tile[] = [];
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				ts.push(this.GetTile({ row: row, col: col })!);
			}
		}
		return ts;
	}
	/**
	 * Initializes the tiles when creating the board to either an empty or a water tile.
	 */
	private InitTiles() {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const state = Math.random() < 0.1 ? TILETYPE.WATER : TILETYPE.EMPTY;
				let tmp: Tile = {
					row: i,
					col: j,
					content: state,
					sun: 0,
					water: 0,
					plant: NO_PLANT,
					growth: 0,
				};
				this.SetTile(tmp);
			}
		}
	}
	/**
	 * Moves the sun from right to left over the board.
	 */
	private MoveSun() {
		this.Sun--;
		this.Sun < -SUN_RANGE ? (this.Sun = this.cols - 1 + SUN_RANGE) : this.Sun;
	}
	/**
	 * Sets the sunlight value of all tiles within the sun's range. Removes sunlight from tiles outside the sun's range.
	 */
	private UpdateSunTiles() {
		//The sun shines light on vertical strips of tiles, centered on the column of the current sun position.
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				if (col < 0 || col >= this.cols) {
					continue;
				}

				const distance = Math.abs(col - this.Sun);
				const lightLevel = distance < SUN_RANGE ? 1 + Math.random() * 0.1 * Math.max(0, SUN_RANGE - distance) : 0;
				const tmp = this.GetTile({ row: row, col: col })!;
				if (tmp) {
					tmp.sun = lightLevel;
					this.SetTile(tmp);
				}
			}
		}
	}
	/**
	 * Hydrates tiles next to water sources. Increases their hydration by 1 + Random(0, 1]. Hydration per tile is capped at MAX_HYDRATION.
	 */
	private Hydrate() {
		const waterTiles: Tile[] = [];
		this.GetAllTiles().forEach((tile) => {
			if (tile.content == TILETYPE.WATER) {
				waterTiles.push(tile);
			}
		});
		waterTiles.forEach((waterTile) => {
			const adjs = this.GetAdjacentTiles({ row: waterTile.row, col: waterTile.col });
			adjs.forEach((neighbor) => {
				neighbor.water += 1 + Math.random();
				if (neighbor.water > MAX_HYDRATION) {
					neighbor.water = MAX_HYDRATION;
				}
				this.SetTile(neighbor);
			});
		});
	}
	/**
	 * Tells all plants to attempt to grow via their tick methods.
	 */
	private Grow() {
		this.GetAllTiles().forEach((tile) => {
			this.tickTile(tile);
		});
	}

	/**
	 * This plant will attempt to grow one stage based on its base growth rate multiplied by the current sunlight, water, and friend adjacency conditions.
	 * Consumes 0.5 water from its tile on a failed growth, and 1 water on a successful growth.
	 */
	private tickTile(tile: Tile) {
		if (tile.plant == NO_PLANT) {
			return;
		}
		const currRate = Plant.baseGrowthRate(tile.plant) * tile.sun * tile.water * this.rateViaAdjacency(tile);
		let waterUse = 0.5;
		if (tile.growth < Plant.growthCap(tile.plant) && Math.random() < currRate) {
			tile.growth++;
			waterUse = 1;
		}
		this.SetTile(tile);
		this.Dehydrate({ row: tile.row, col: tile.col }, waterUse);
	}

	/**
	 * Using the current state of the board, get a rate (Default: 1, Max: 1 + 8*GLOBAL_FRIEND_RATE) to increase the growth rate of this plant based on how many "friend plants" are planted next to it.
	 */
	private rateViaAdjacency(t: Tile): number {
		//TODO: IMPLEMENT ADJACENCY GETTERS
		const list = this.GetAdjacentPlants(t);
		if (!list) {
			return 1;
		}
		const myFriends = Plant.adjacencyFriends(t.plant);
		let rateAdjustment = 1;
		list.forEach((friend) => {
			if (myFriends.includes(friend)) {
				rateAdjustment += GLOBAL_FRIEND_RATE;
			}
		});
		return rateAdjustment;
	}
}
