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
		this.initBoard();
	}
	private initBoard() {
		//DETERMINE INITIAL BOARD SUNLIGHT LEVELS
	}
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
	 * @param cell The [row, col] position at which to get adjacency data.
	 * @returns a list of names of the plants adjacent to a given tile, excluding the given tile or tiles without plants. If no adjacent tiles have plants, returns null.
	 */
	public GetAdjacencyList(cell: Cell): string[] | null {
		const retVal: string[] = [];
		for (let c = cell.col - 1; c < cell.col + 1; c++) {
			for (let r = cell.row - 1; r < cell.row + 1; r++) {
				if (c < 0 || r < 0 || c >= this.cols || r >= this.rows || c == cell.col || r == cell.row) {
					continue;
				} else {
					const tmp = this.GetTile({ col: c, row: r });
					if (tmp && tmp.plant) {
						retVal.push(tmp.plant.name);
					}
				}
			}
		}

		return retVal.length > 0 ? retVal : null;
	}
}
