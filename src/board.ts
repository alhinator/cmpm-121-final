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
	public toString(): string {
		let retStr = "";
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				retStr += this.board[i][j].plant?.displayCharacters[this.board[i][j].plant!.growth];
			}
			retStr += "\n";
		}
		return retStr;
	}

	public GetTile(_c: Cell): Tile | null {
		if (_c.row >= this.rows || _c.row < 0 || _c.col >= this.cols || _c.col < 0) {
			return null;
		}
		return this.board[_c.row][_c.col];
	}
}
