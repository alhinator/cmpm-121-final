import Board from "./board";
import StateManager from "./save";

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
    private static undoButton: HTMLButtonElement;
    private static redoButton: HTMLButtonElement;
    private static board: Board;
    private static stateMGR:StateManager

    /**
     * Initializes the turn counter and adds a button to advance the turn.
     * @param app The parent container where the elements will be appended.
     */
    public static initialize(app: HTMLDivElement, board: Board, stateMGR:StateManager): void {
        this.board = board;
        this.stateMGR = stateMGR;

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
            this.stateMGR.incrementTurn();
            this.incrementTurn();
            this.stateMGR.saveTo("autosave");
        });

        // Create and append the undo button
        this.undoButton = document.createElement("button");
        this.undoButton.innerHTML = "Undo";
        app.append(this.undoButton);

        // Create and append the redo button
        this.redoButton = document.createElement("button");
        this.redoButton.innerHTML = "Redo";
        app.append(this.redoButton);

        // Attach event listener to undo
        this.undoButton.addEventListener("click", () => {
            this.stateMGR.undo();
            this.stateMGR.saveTo("autosave");
            this.update();
        });

        // Attach event listener to redo
        this.redoButton.addEventListener("click", () => {
            this.stateMGR.redo();
            this.stateMGR.saveTo("autosave");
            this.update();
        });

        this.update();
    }

    public static update(): void {
        // Set the states of the undo and redo buttons
        this.undoButton.disabled = !this.stateMGR.canUndo();
        this.redoButton.disabled = !this.stateMGR.canRedo();

        // Update the turn label
        if (this.header) {
            this.header.innerHTML = "TURN: " + this.stateMGR.turn;
        }
    }

    /**
     * Advances the turn counter by 1 and updates the header display.
     */
    private static incrementTurn(): void {
        this.turn += 1;
        this.board.Tick();
        this.update();
    }

    /**
     * Gets the current turn count.
     */
    public static get currentTurn(): number {
        return this.turn;
    }
}
