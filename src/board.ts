import Plant from "./plant";

export enum TILETYPE {
	EMPTY,
	PLANT,
	WATER,
}

export interface Cell {
	row: number;
	col: number;
}

export interface Tile {
	cell: Cell;
	content: TILETYPE;
	sun: number;
	plant: Plant | null;
}

export default class Board {
	cols: number;
	rows: number;
	board: Tile[][];
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
			const tmp: Tile[] = [];
			for (let j = 0; j < this.cols; j++) {
				tmp.push({
					cell: { row: i, col: j },
					content: TILETYPE.EMPTY,
					sun: 0,
					plant: null,
				});
			}
		}
		return retStr;
	}

	// public toStringDisplay(){

	// }
}
