export default class Plant {
	plantName: string;
    displayCharacters:string[];
	growthSpeed: number;
	growth: number = 0;
	growthCap: number;

	constructor(plantData: string) {
		const data = JSON.parse(plantData);
		if (!data.plantName || !data.growthSpeed || !data.growthCap || !data.displayCharacters) {
			throw new Error("Plant: Constructor: Bad JSON data.");
		}

		this.plantName = data.plantName;
		this.growthSpeed = data.growthSpeed;
		this.growthCap = data.growthCap;
        this.displayCharacters = data.displayCharacters;
	}
}
