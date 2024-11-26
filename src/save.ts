import Player from "./player";

export interface saveData {
	boardState: ArrayBuffer;
	playerState: Player;
}

/**
 * @constant The size of 1 (one) float64
 */
const floatSize = 64;
/**
 * @constant The size of a Tile data structure, in bits
 */
export const TileDataSize = floatSize * 7;
/**
 * @constant The size of a Player data structure, in bits
 */
export const PlayerDataSize = floatSize * 7;
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
export interface staticBoardData{
	cols:number,
	rows:number,
	sunPosition?:number
}

export default class StateManager {
    private stateBuffer:ArrayBuffer;
    private boardDataLength:number;
    
    constructor(data:staticBoardData){
        this.boardDataLength = data.rows * data.cols * TileDataSize + addlData
        this.stateBuffer = new ArrayBuffer(this.boardDataLength + PlayerDataSize);
    }
    public get board(){
        const bv = new DataView(this.stateBuffer, 0, this.boardDataLength)
        return bv;
    }
    public setColsAndRows(cols: number, rows: number) {
		const MainOffset = rows * cols * TileDataSize;
		const bv = new DataView(this.stateBuffer, MainOffset, addlData);
		bv.setFloat64(64, cols);
		bv.setFloat64(128, rows);
	}
    
    


    // ------- Static save/load to localstorage -------
	public static SaveTo(slotID: string, data: saveData) {
		localStorage.setItem(slotID, JSON.stringify(data));
	}
	public static LoadFrom(slotID: string): saveData | null {
		if (!localStorage.getItem(slotID)) {
			return null;
		} else {
			return JSON.parse(localStorage.getItem(slotID)!);
		}
	}
    
}
