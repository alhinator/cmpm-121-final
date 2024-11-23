import Board from "./board";

/**
 * @class Represents the player character in the game.
 */
export default class Player {
    private static readonly avatarPath: string = "/assets/playerAvatar.png";
    private static avatar: HTMLImageElement | null = null;

    private readonly canvas: HTMLCanvasElement;
    private readonly tileSize: number;
    private readonly board: Board;
    private x: number;
    private y: number;
    private isMoving: boolean = false;

    /**
     * @function Loads the player avatar image. Must be called before creating any Player instances.
     */
    public static LoadAvatar(): void {
        if (!Player.avatar) {
            Player.avatar = new Image();
            Player.avatar.src = Player.avatarPath;
        }
    }

    /**
     * @param canvas The canvas element on which the player will be drawn.
     * @param initialX The starting X-coordinate (in tiles) of the player.
     * @param initialY The starting Y-coordinate (in tiles) of the player.
     * @function Constructs a new Player instance and initializes its position.
     */
    constructor(canvas: HTMLCanvasElement, board: Board, tileSize: number, initialX: number, initialY: number) {
        if (!Player.avatar) {
            throw new Error("Player: Avatar image not loaded. Call Player.LoadAvatar() first.");
        }
        this.canvas = canvas;
        this.board = board;
        this.tileSize = tileSize;
        this.x = initialX * tileSize;
        this.y = initialY * tileSize;
        this.setupKeyboardListeners();
    }

    // -------- Property Getters --------
    /**
     * Get the current X-coordinate of the player in pixels.
     */
    public get positionX(): number {
        return this.x;
    }

    /**
     * Get the current Y-coordinate of the player in pixels.
     */
    public get positionY(): number {
        return this.y;
    }

    /**
     * Draws the player avatar at the current position on the canvas.
     */
    public draw(context: CanvasRenderingContext2D): void {
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear previous frame
        context.drawImage(Player.avatar!, this.x, this.y, this.tileSize, this.tileSize);
    }

    /**
     * Moves the player character by one tile in a specified direction, constrained by the canvas dimensions.
     * @param deltaX The number of tiles to move in the X direction.
     * @param deltaY The number of tiles to move in the Y direction.
     */
    private move(deltaX: number, deltaY: number): void {
        const newX = this.x + deltaX * this.tileSize;
        const newY = this.y + deltaY * this.tileSize;

        // Constrain movement to the canvas bounds
        if (newX >= 0 && newX < this.canvas.width && newY >= 0 && newY < this.canvas.height) {
            this.x = newX;
            this.y = newY;
        }
    }

    /**
     * Sets up keyboard listeners for player movement using WASD or arrow keys.
     * Prevents continuous movement by toggling `isMoving`.
     */
    private setupKeyboardListeners(): void {
        window.addEventListener("keydown", (event) => {
            if (this.isMoving) return;

            switch (event.key) {
                case "ArrowUp":
                case "w":
                    this.move(0, -1);
                    break;
                case "ArrowDown":
                case "s":
                    this.move(0, 1);
                    break;
                case "ArrowLeft":
                case "a":
                    this.move(-1, 0);
                    break;
                case "ArrowRight":
                case "d":
                    this.move(1, 0);
                    break;
                case "x":
                    this.board.Sow({
                        row: Math.round(this.y / this.tileSize) + 1,
                        col: Math.round(this.x / this.tileSize)
                    }, "Wheat");
                    break;
                case "z":
                    this.board.Reap({
                        row: Math.round(this.y / this.tileSize) + 1,
                        col: Math.round(this.x / this.tileSize)
                    });
                    break;
            }

            this.isMoving = true;
        });

        window.addEventListener("keyup", () => {
            this.isMoving = false;
        });
    }
}
