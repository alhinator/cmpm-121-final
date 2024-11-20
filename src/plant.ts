import PlantData from "../src/PlantData.json";

/**
 * @constant PLANTS contains the JSON data for all plant types. Used as the core of a flyweight structure for the Plant class.
 */
const PLANTS = JSON.parse(JSON.stringify(PlantData));

/**
 * @class Plant contains name, display character, growth rate, and the growth cap for the plant at that
 */
export default class Plant {
	public readonly name: string;
	private currentGrowth: number = 0;
	constructor(name: string) {
		const data = PLANTS[name];
		if (!data.plantName || !data.growthRate || !data.growthCap || !data.displayCharacters) {
			throw new Error("Plant: Constructor: Bad JSON data or bad name argument.");
		}
		this.name = name;
	}
	public get growthRate(): number {
		const retVal = PLANTS[this.name].growthRate;
		//TODO: Implement growth rate fluctuation when a plant is nearby other plants of specific types.
		return retVal;
	}
    public get growth():number {
        return this.currentGrowth;
    }
    public get displayCharacter():string{
        return PLANTS[this.name].displayCharacter[this.growth];
    }
    public get growthCap():number{
        return PLANTS[this.name].growthCap;
    }
}
