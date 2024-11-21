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
const SUN_RANGE = 2;
/**
 * @constant MAX_HYDRATION is the maximum possible hydration level of a tile.
 */
const MAX_HYDRATION = 4;

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
	private sunPosition: number = -1;

	/**
	 * @constructor Initialize an empty board.
	 * @param cols Width of the board to initialize to. Cannot be changed once set.
	 * @param rows Height of the board to initialize to. Cannot be changed once set.
	 */
	constructor(cols: number, rows: number) {
		this.cols = cols;
		this.rows = rows;
		this.board = [];
		for (let i = 0; i < rows; i++) {
			const tmp: Tile[] = [];
			for (let j = 0; j < cols; j++) {
				tmp.push({
					cell: { row: i, col: j },
					content: TILETYPE.EMPTY,
					sun: 0,
					water: 0,
					plant: null,
				});
			}
		}
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
			tmp.water > amount ? tmp.water -= amount : (tmp.water = 0);
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
	 * Moves the sun from right to left over the board.
	 */
	private MoveSun() {
		this.sunPosition--;
		this.sunPosition < 0 ? (this.sunPosition = this.cols - 1) : this.sunPosition;
	}
	/**
	 * Sets the sunlight value of all tiles within the sun's range to 1 + Random(0, distance from sun]
	 */
	private UpdateSunTiles() {
		//The sun shines light on vertical strips of tiles, centered on the column of the current sun position.
		for (let col = this.sunPosition - SUN_RANGE; col < this.sunPosition + SUN_RANGE; col++) {
			if (col < 0 || col >= this.cols) {
				continue;
			}
			for (let row = 0; row < this.rows; row++) {
				const lightLevel = SUN_RANGE - Math.abs(this.sunPosition - col);
				this.GetTile({ row: row, col: col })!.sun = lightLevel >= 0 ? 1 + Math.random() * lightLevel : 0;
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
