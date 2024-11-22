import Board from "./board";

/**
 * @constant INITIAL_TURN The starting value for the turn counter.
 */
const INITIAL_TURN = 0;

/**
 * @class Manages the game's turn-based system.
 */
export default class Time {
    private static turn: number = INITIAL_TURN;
    private static header: HTMLHeadingElement | null = null;
    private static board: Board;

    /**
     * Initializes the turn counter and adds a button to advance the turn.
     * @param app The parent container where the elements will be appended.
     */
    public static initialize(app: HTMLDivElement, board: Board): void {
        this.board = board;

        // Create and append the turn header
        this.header = document.createElement("h1");
        this.header.innerHTML = "TURN: " + this.turn.toString();
        app.append(this.header);

        // Create and append the turn button
        const turnButton = document.createElement("button");
        turnButton.id = "reset-game";
        turnButton.innerHTML = "🚮";
        app.append(turnButton);

        // Attach event listener to increment the turn
        turnButton.addEventListener("click", () => {
            this.incrementTurn();
        });
    }

    /**
     * Advances the turn counter by 1 and updates the header display.
     */
    private static incrementTurn(): void {
        this.turn += 1;
        this.board.Tick();
        if (this.header) {
            this.header.innerHTML = "TURN: " + this.turn.toString();
        }
    }

    /**
     * Gets the current turn count.
     */
    public static get currentTurn(): number {
        return this.turn;
    }
}
