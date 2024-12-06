import { translation } from "./i18n";

/**
 * @class PlantDSL provides a fluent interface for defining plant behaviors.
 */
class PlantDSL {
    private plantData: Record<string, any> = {};

    name(value: string): void {
        this.plantData.name = value;
    }

    sprites(values: string[]): void {
        this.plantData.sprites = values;
    }

    growthRate(value: number): void {
        this.plantData.growthRate = value;
    }

    growthCap(value: number): void {
        this.plantData.growthCap = value;
    }

    growsWhen(condition: (context: any) => boolean): void {
        this.plantData.growsWhen = condition;
    }

    adjacencyFriends(value: string[]): void {
        this.plantData.adjacencyFriends = value;
    }

    reward(value: string[]): void {
        this.plantData.reward = value;
    }

    get data(): Record<string, any> {
        return this.plantData;
    }
}

/**
 * Helper function to compile plant definitions.
 */
function plantCompiler(plantDefinition: (dsl: PlantDSL) => void): Record<string, any> {
    const dsl = new PlantDSL();
    plantDefinition(dsl);
    return dsl.data;
}

/**
 * All plant definitions using the DSL.
 */
const allPlantDefinitions = [
    function wheat($: PlantDSL) {
        $.name("wheat");
        $.sprites(["🌱", "🌿", "🌾", "🌾", "🌾"]); // Sprites for each growth stage
        $.growthRate(0.1);
        $.growthCap(4);
        $.growsWhen(({ soilMoisture, neighbors }: any) =>
            soilMoisture >= 0.5 && neighbors.includes("Corn")
        );
        $.adjacencyFriends(["wheat", "corn"]);
        $.reward(["0Seed", "0Seed"]);
    },
    function corn($: PlantDSL) {
        $.name("corn");
        $.sprites(["🌱", "🌽", "🌽", "🌽"]); // Sprites for each growth stage
        $.growthRate(0.075);
        $.growthCap(3);
        $.growsWhen(({ temperature, soilMoisture }: any) =>
            temperature > 20 && soilMoisture >= 0.3
        );
        $.adjacencyFriends(["wheat"]);
        $.reward(["1Seed"]);
    },
    function rice($: PlantDSL) {
        $.name("rice");
        $.sprites(["🌱", "🌾", "🍚", "🍚", "🍚", "🍚"]); // Sprites for each growth stage
        $.growthRate(0.15);
        $.growthCap(5);
        $.growsWhen(({ soilMoisture, neighbors }: any) =>
            soilMoisture >= 0.8 && neighbors.every((p: string) => p === "rice")
        );
        $.adjacencyFriends(["rice"]);
        $.reward(["2Seed", "2Seed"]);
    },
];

/**
 * Compile all plants into usable data.
 */
export const PLANTS = allPlantDefinitions.map(plantCompiler);

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
    public static get numPlants() {
        return PLANTS.length;
    }

    /**
     * Get the name of the plant as defined in the DSL.
     */
    public static name(id: number): string {
        return PLANTS[id]?.name || "Unknown";
    }

    /**
     * Gets the localized display name of the plant.
     */
    public static displayName(id: number): string {
        return translation(this.name(id));
    }

    /**
     * Get the emoji representing the plant at a specific growth stage.
     */
    public static sprite(id: number, growth: number): string {
        const sprites = PLANTS[id]?.sprites || [];
        return sprites[growth] || MT_TILE;
    }

    /**
     * Get the base growth rate of the plant.
     */
    public static baseGrowthRate(id: number): number {
        return PLANTS[id]?.growthRate || 0;
    }

    /**
     * Get the growth stage at which this plant has reached maturity.
     */
    public static growthCap(id: number): number {
        return PLANTS[id]?.growthCap || 0;
    }

    /**
     * Get the display character (emoji) for this plant.
     */
    public static displayCharacter(id: number, growth: number): string {
        return this.sprite(id, growth);
    }

    /**
     * Determine if a plant can grow under given conditions.
     */
    public static growsWhen(id: number, context: any): boolean {
        return PLANTS[id]?.growsWhen?.(context) || false;
    }

    /**
     * Get a string array of plants this plant benefits from being planted next to.
     */
    public static adjacencyFriends(id: number): string[] {
        return PLANTS[id]?.adjacencyFriends || [];
    }

    /**
     * Get a string array of the rewards granted when this plant is reaped at max growth.
     */
    public static reward(id: number): string[] {
        return PLANTS[id]?.reward || [];
    }
}
