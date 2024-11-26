import Player from "./player";

export interface saveData {
	boardState: ArrayBuffer;
	playerState: Player;
}

export default class StateManager {
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
