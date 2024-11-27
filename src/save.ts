import Player from "./player";
import Plant from "./plant";

export interface saveData {
	boardState: DataView;
	playerState: Player;
}

/**
 * @constant The size of 1 (one) float64
 */
export const floatSize = 8;
/**
 * @constant The size of a Tile data structure, in bits
 */
export const TileDataSize = floatSize * 7;
/**
 * @constant The size of a Player data structure, in bits
 */
export const PlayerDataSize = floatSize * 4 + Plant.numPlants * floatSize * 4;
/**
 * @constant The size of additional static board data, in bits
 */
export const addlData = floatSize * 3;
/**
 * Additional points of data we need to store
 * Currently:
 * @float cols
 * @float rows
 * @float sunPosition
 */
export interface NontileBoardData {
	cols: number;
	rows: number;
	sunPosition?: number;
}

/**
 * Maintains the save state of the board and player in a 1-D byte array.
 */
export default class StateManager {
	private stateBuffer: ArrayBuffer;
	private boardDataLength: number;
	/**
	 *
	 * @param data The nontile board data: number of rows and columns in the board.
	 */
	constructor(data: NontileBoardData) {
		this.boardDataLength = data.rows * data.cols * TileDataSize + addlData;
		this.stateBuffer = new ArrayBuffer(this.boardDataLength + PlayerDataSize);
	}
	public get board(): DataView {
		const bv = new DataView(this.stateBuffer, 0, this.boardDataLength);
		return bv;
	}
	public get player(): DataView {
		const bv = new DataView(this.stateBuffer, this.boardDataLength, PlayerDataSize);
		return bv;
	}
	public setColsAndRows(cols: number, rows: number) {
		const MainOffset = rows * cols * TileDataSize;
		const bv = new DataView(this.stateBuffer, MainOffset, addlData);
		bv.setFloat64(8, cols);
		bv.setFloat64(16, rows);
	}

	public saveTo(slotID: number) {
		const data_to_string = new TextDecoder().decode(this.stateBuffer)
		console.log(data_to_string);
		localStorage.setItem("game_save_" + slotID, data_to_string);
	}

	public loadFrom(slotID: number) {
		const string_to_data = new TextEncoder().encode(localStorage.getItem("game_save_" + slotID)!);
		this.stateBuffer = string_to_data.buffer;
	}

	public getSlots(): number[] {
		let slots: number[] = [];
		for(let i = 0; i < localStorage.length; i++){
			let key = localStorage.key(i)!;
			if(key.startsWith("game_save_")) {
				slots.push(parseInt(key.substring("game_save_".length)))
			}
		}
		return slots.sort();
	}

	public getOpenSlotId(): number {
		let id = 0;
		let slots = this.getSlots();
		while(slots.includes(id)) {
			id++;
		}
		return id;
	}
}
