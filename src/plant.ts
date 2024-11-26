import PlantData from "../data/PlantData.json";
/**
 * @constant PLANTS contains the JSON data for all plant types. Used as the core of a flyweight structure for the Plant class.
 */
const PLANTS = JSON.parse(JSON.stringify(PlantData));

/**
 * @constant GLOBAL_FRIEND_RATE is the multiplicative rate at which plants grow faster per adjacent plant they consider a friend.
 */
export const GLOBAL_FRIEND_RATE = 0.05;
/**
 * @constant MT_TILE is the default character to be used when a tile contains no plant.
 */
const MT_TILE = " ";
/**
 * @constant NO_PLANT the ID for when there isn't a plant in a tile.
 */
export const NO_PLANT = -1;
/**
 * @class The accessor class that assists the board in getting plant data.
 */
export default class Plant {
	// -------- Property Getters --------
	/**
	 * Get the name of the plant as defined in the JSON file.
	 */
	public static name(id: number) {
		const retVal = PLANTS[id.toString()].name;
		return retVal;
	}
	/**
	 * Get the base growth rate as defined in the JSON file.
	 */
	public static baseGrowthRate(id: number): number {
		const retVal = PLANTS[id.toString()].growthRate;
		return retVal;
	}
	/**
	 * Get the current character to display for this plant, based on its plant type and stage.
	 */
	public static displayCharacter(id: number, growth: number): string {
		if (PLANTS[id.toString()] == undefined) {
			return MT_TILE;
		}
		return PLANTS[id.toString()].displayCharacters[growth];
	}
	/**
	 * Get the growth stage at which this plant has reached maturity. Equal to the largest index - NOT the length - of the displayCharacters array.
	 */
	public static growthCap(id: number): number {
		return PLANTS[id.toString()].growthCap;
	}
	/**
	 * Get a string array of plants this plant benefits from being planted next to.
	 */
	public static adjacencyFriends(id: number): string[] {
		return PLANTS[id.toString()].adjacencyFriends;
	}
	/**
	 * Get a string array of the rewards granted when this plant is reaped at max growth.
	 */
	public static reward(id: number): string[] {
		return PLANTS[id.toString()].reward;
	}

	
}
