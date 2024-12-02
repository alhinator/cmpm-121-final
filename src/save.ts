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
	private turnDataLength: number;
	private currentSlotId: number = -1;
	/**
	 *
	 * @param data The nontile board data: number of rows and columns in the board.
	 */
	constructor(data: NontileBoardData) {
		this.boardDataLength = data.rows * data.cols * TileDataSize + addlData;
		this.turnDataLength = this.boardDataLength + PlayerDataSize;
		this.stateBuffer = new ArrayBuffer(floatSize + this.turnDataLength);
	}
	public get turn(): number {
		const bv = new DataView(this.stateBuffer);
		return bv.getFloat64(0);
	}
	private get turnOffset(): number {
		return floatSize + this.turn * this.turnDataLength;
	}
	public get board(): DataView {
		const bv = new DataView(this.stateBuffer, this.turnOffset, this.boardDataLength);
		return bv;
	}
	public get player(): DataView {
		const bv = new DataView(this.stateBuffer, this.turnOffset + this.boardDataLength, PlayerDataSize);
		return bv;
	}

	public incrementTurn() {
		const pastBuffer = new Uint8Array(this.stateBuffer, 0, this.turnOffset);
		const currentTurnBuffer = new Uint8Array(this.stateBuffer, this.turnOffset, this.turnDataLength);
		this.stateBuffer = new Uint8Array([...pastBuffer, ...currentTurnBuffer, ...currentTurnBuffer]).buffer;
		const bv = new DataView(this.stateBuffer);
		bv.setFloat64(0, this.turn + 1);
		this.autosave();
	}

	public canUndo() : boolean {
		return this.turn > 0;
	}

	public undo() {
		if(this.canUndo()) {
			const bv = new DataView(this.stateBuffer);
			bv.setFloat64(0, this.turn - 1);
			this.autosave();
		}
	}
	
	public canRedo() {
		return this.turnOffset + this.turnDataLength < this.stateBuffer.byteLength;
	}

	public redo() {
		if(this.canRedo()) {
			const bv = new DataView(this.stateBuffer);
			bv.setFloat64(0, this.turn + 1);
			this.autosave();
		}
	}

	public setColsAndRows(cols: number, rows: number) {
		const MainOffset = rows * cols * TileDataSize;
		const bv = new DataView(this.stateBuffer, MainOffset, addlData);
		bv.setFloat64(8, cols);
		bv.setFloat64(16, rows);
	}

	private getOpenSlotId(): number {
		let id = 0;
		let slots = this.getSlots();
		while(slots.includes(id)) {
			id++;
		}
		return id;
	}

	public getCurrentSlotId() {
		return this.currentSlotId;
	}

	public save() {
		if(this.hasAutosave() && this.currentSlotId == this.getAutosaveSlot()) {
			localStorage.removeItem("game_autosave");
			localStorage.removeItem("game_autosave_slot");
		}
		if(this.currentSlotId < 0) {
			this.currentSlotId = this.getOpenSlotId();
		}
		localStorage.setItem("game_save_" + this.currentSlotId, this.encode());
	}

	public newSave() {
		this.currentSlotId = -1;
		this.save();
	}

	public autosave() {
		localStorage.setItem("game_autosave", this.encode());
		localStorage.setItem("game_autosave_slot", JSON.stringify(this.currentSlotId));
	}

	public hasAutosave(): boolean {
		return localStorage.getItem("game_autosave") !== null;
	}

	private getAutosaveSlot() : number {
		if(!this.hasAutosave()) {
			return -1;
		} else {
			return JSON.parse(localStorage.getItem("game_autosave_slot")!);
		}
	}

	public loadFrom(slotID: number) {
		this.decode(localStorage.getItem("game_save_" + slotID)!);
		this.currentSlotId = slotID;
	}

	public loadAutosave() {
		if(this.hasAutosave()) {
			this.decode(localStorage.getItem("game_autosave")!);
			this.currentSlotId = this.getAutosaveSlot();
			this.save();
		}
	}

	public hasSlot(slotID: number): boolean {
		return localStorage.getItem("game_save_" + slotID) !== null;
	}

	public removeSlot(slotID: number) {
		localStorage.removeItem("game_save_" + slotID);
	}

	public getSlots(): number[] {
		let slots: number[] = [];
		for(let i = 0; i < localStorage.length; i++){
			let key = localStorage.key(i)!;
			if(key.startsWith("game_save_")) {
				let id = parseInt(key.substring("game_save_".length));
				if(!isNaN(id)) {
					slots.push(id);
				}
			}
		}
		return slots.sort();
	}

	private encode(): string {
		let result = "";
		const bytes = new Uint8Array(this.stateBuffer);
		for(let i = 0; i < bytes.length; i++) {
			result += String.fromCharCode(bytes[i]);
		}
		return result;
	}

	private decode(str: string): void {
		const arr = new Uint8Array(str.length);
		for(let i = 0; i < str.length; i++) {
			arr[i] = str.charCodeAt(i);
		}
		this.stateBuffer = arr.buffer;
	}
}
