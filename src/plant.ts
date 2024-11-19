export default class Plant {
	plantName: String;

	growthSpeed: number;
	growth: number = 0;
	growthCap: number;

	watered: boolean;
	constructor(plantData: string) {
		const data = JSON.parse(plantData);
		if (!data.plantName || !data.growthSpeed || !data.growthCap) {
			throw new Error("Plant: Constructor: Bad JSON data.");
		}
		this.plantName = data.plantName;
		this.growthSpeed = data.growthSpeed;
		this.growthCap = data.growthCap;
		this.watered = false;
	}
}
