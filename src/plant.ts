import PlantData from "../data/PlantData.json";
import Board, { Cell } from "./board.ts";

/**
 * @constant PLANTS contains the JSON data for all plant types. Used as the core of a flyweight structure for the Plant class.
 */
const PLANTS = JSON.parse(JSON.stringify(PlantData));

/**
 * @constant GLOBAL_FRIEND_RATE is the multiplicative rate at which plants grow faster per adjacent plant they consider a friend.
 */
const GLOBAL_FRIEND_RATE = 0.05;

/**
 * @class An instance of a Plant contains data for a plant object at a position on the board.
 */
export default class Plant {
	/**
	 * The reference to the gameplay board. Must be set by calling Plant.SetBoard() before creating any plants.
	 */
	private static boardRef: Board;
	/**
	 * @function Sets the static class reference to a Board instance. MUST be called before creating any plants.
	 */
	public static SetBoard(board: Board) {
		Plant.boardRef = board;
	}

	/**
	 * @property The name of the plant as specified by PlantData.json.
	 */
	public readonly name: string;
	private currentGrowth: number = 0;
	private readonly position: Cell;
	/**
	 * @param name The name of the plant. Must match an existing name in the PlantData.json file.
	 * @param position The [row, col] position of the tile this plant is being placed in.
	 * @function Constructs a new instance of a plant using a name string and a cell position. Cannot be used until the static class member "boardRef" has been set.
	 */
	constructor(name: string, position: Cell) {
		if (!Plant.boardRef) {
			throw new Error("Plant: Static Board reference not set to instance of object.");
		}
		const data = PLANTS[name];
		if (!data.plantName || !data.growthRate || !data.growthCap || !data.displayCharacters || !data.adjacencyFriends) {
			throw new Error("Plant: Constructor: Bad JSON data or bad name argument.");
		}
		this.name = name;
		this.position = position;
	}

	// -------- Property Getters --------
	/**
	 * Get the base growth rate as defined in the JSON file.
	 */
	public get baseGrowthRate(): number {
		const retVal = PLANTS[this.name].growthRate;
		return retVal;
	}
	/**
	 * Get the current growth stage of the plant. Begins at zero and is capped by the plant's growthCap.
	 */
	public get growth(): number {
		return this.currentGrowth;
	}
	/**
	 * Get the current character to display for this plant, based on its plant type and stage.
	 */
	public get displayCharacter(): string {
		return PLANTS[this.name].displayCharacter[this.growth];
	}
	/**
	 * Get the growth stage at which this plant has reached maturity. Equal to the largest index - NOT the length - of the displayCharacters array.
	 */
	public get growthCap(): number {
		return PLANTS[this.name].growthCap;
	}
	/**
	 * Get a string array of plants this plant benefits from being planted next to.
	 */
	public get adjacencyFriends(): string[] {
		return PLANTS[this.name].adjacencyFriends;
	}
	/**
	 * Get a string array of the rewards granted when this plant is reaped at max growth.
	 */
	public get reward(): string[] {
		return PLANTS[this.name].reward;
	}

	/**
	 * Using the current state of the board, get a rate (Default: 1, Max: 1 + 8*GLOBAL_FRIEND_RATE) to increase the growth rate of this plant based on how many "friend plants" are planted next to it.
	 */
	private get rateViaAdjacency(): number {
		//TODO: IMPLEMENT ADJACENCY GETTERS
		const list = Plant.boardRef.GetAdjacentPlants(this.position);
		if (!list) {
			return 1;
		}
		const myFriends = this.adjacencyFriends;
		let rateAdjustment = 1;
		list.forEach((friend) => {
			if (myFriends.includes(friend)) {
				rateAdjustment += GLOBAL_FRIEND_RATE;
			}
		});
		return rateAdjustment;
	}

	/**
	 * This plant will attempt to grow one stage based on its base growth rate multiplied by the current sunlight, water, and friend adjacency conditions.
	 * Consumes 0.5 water from its tile on a failed growth, and 1 water on a successful growth.
	 */
	public tick() {
		const tile = Plant.boardRef.GetTile(this.position)!;
		const currRate = this.baseGrowthRate * tile.sun * tile.water * this.rateViaAdjacency;
		let waterUse = 0.5;
		if (this.growth < this.growthCap && Math.random() < currRate) {
			this.currentGrowth++;
			waterUse = 1;
		}
		Plant.boardRef.Dehydrate(tile.cell, waterUse);
	}
}
