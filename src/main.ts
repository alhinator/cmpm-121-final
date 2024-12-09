import Board from "./board.ts";
import Player from "./player.ts";
import Time from "./time.ts";
import StateManager from "./save.ts";
import Phaser from "phaser";
import { getAllLanguageCodes, getLanguageCode, getLanguageName, languageIsRightToLeft, setLanguageCode, translation } from "./i18n.ts";

/**
 * @constant APP_NAME The name of the application displayed in the title and header.
 */
const APP_NAME = "121Farm";

/**
 * @constant TILE_SIZE The size of each tile in the grid.
 */
const TILE_SIZE = 32;

class MainScene extends Phaser.Scene {
	readonly StateMGR: StateManager = new StateManager();
	readonly board = new Board(StateManager.cols, StateManager.rows, TILE_SIZE, this.StateMGR);
	readonly player = new Player(this.board, TILE_SIZE, 5, 5, this.StateMGR);

	inventory?: HTMLParagraphElement;
	win?: HTMLHeadingElement;
	uiRoot?: HTMLDivElement;

	refreshSaveUI(container: HTMLDivElement) {
		container.innerHTML = ""; // Clear the container
		Time.update();

		let slots = this.StateMGR.getSlots();
		slots.forEach((slot) => {
			const btn = document.createElement("button");
			if (slot == this.StateMGR.getCurrentSlotId()) {
				btn.innerHTML = translation("save_slot", slot);
				btn.addEventListener("click", () => {
					this.StateMGR.save();
					this.refreshSaveUI(container);
				});
			} else {
				btn.innerHTML = translation("load_slot", slot);
				btn.addEventListener("click", () => {
					this.StateMGR.loadFrom(slot);
					this.refreshSaveUI(container);
				});
			}
			container.append(btn);
			container.append(document.createElement("br"));
		});

		const saveBtn = document.createElement("button");
		saveBtn.innerHTML = translation("new_save");
		saveBtn.addEventListener("click", () => {
			this.StateMGR.newSave();
			this.refreshSaveUI(container);
		});
		container.append(saveBtn);
	}

	addLanguageUI() {
		let languageSelect = document.createElement("select");
		let languageCodes = getAllLanguageCodes();
		languageCodes.forEach((code) => {
			let languageOption = document.createElement("option");
			languageOption.innerText = getLanguageName(code);
			languageOption.value = code;
			if (code == getLanguageCode()) {
				languageOption.selected = true;
			}
			languageSelect.append(languageOption);
		});

		languageSelect.addEventListener("change", () => {
			setLanguageCode(languageSelect.value);
			this.createUI();
		});
		this.uiRoot!.append(document.createTextNode(translation("language_label") + ":"));
		this.uiRoot!.append(languageSelect);
	}

	createUI() {
		this.uiRoot!.innerHTML = ""; // Clear UI
		this.uiRoot!.style.textAlign = languageIsRightToLeft() ? "right" : "left";

		Time.initialize(this.uiRoot!, this.board, this.StateMGR);

		this.createMobileControls();

		// MESSY CODE: REFACTOR LATER
		//create and append the player inventory:
		this.inventory = document.createElement("p");
		this.inventory.innerHTML = translation("inventory_label") + ": " + translation("inventory_empty");
		this.uiRoot!.appendChild(this.inventory);

		// create and append the win text
		this.win = document.createElement("h1");
		this.win.innerText = "";
		this.uiRoot!.appendChild(this.win);

		let saveContainer = document.createElement("div");
		this.uiRoot!.append(saveContainer);
		this.refreshSaveUI(saveContainer);
		this.addLanguageUI();
	}
	createMobileControls() {
		// Create and append the mobile controls.
		const playerControls: Map<string, HTMLButtonElement> = new Map<string, HTMLButtonElement>([
			[translation("change_seed_label"), document.createElement("button")],
			[translation("sow_label"), document.createElement("button")],
			[translation("reap_label"), document.createElement("button")],
			[translation("right_label"), document.createElement("button")],
			[translation("left_label"), document.createElement("button")],
			[translation("down_label"), document.createElement("button")],
			[translation("up_label"), document.createElement("button")],
		]);
		const directionals: Map<string, string> = new Map<string, string>([
			[translation("up_label"), "w"],
			[translation("down_label"), "s"],
			[translation("right_label"), "d"],
			[translation("left_label"), "a"],
			[translation("reap_label"), "z"],
			[translation("sow_label"), "x"],
			[translation("change_seed_label"), "c"],
		]);
		playerControls.forEach((value, key) => {
			this.uiRoot!.prepend(value);
			value.classList.add("controlButton");
			value.innerText = key;
			value.addEventListener("click", () => {
				window.dispatchEvent(new KeyboardEvent("keydown", { key: directionals.get(key) }));
				window.dispatchEvent(new KeyboardEvent("keyup", { key: directionals.get(key) }));
			});
		});
		this.uiRoot!.appendChild(document.createElement("br"));
	}

	preload() {
		this.player.preload(this);
	}

	create() {
		this.board.create(this);
		this.player.create(this);

		if (this.StateMGR.hasAutosave()) {
			let ans: string | null = null;
			while (ans == null) {
				ans = prompt(translation("autosave_load_prompt"));
			}
			if (ans.toLowerCase().trimStart().charAt(0) == "y") {
				this.StateMGR.loadAutosave();
			}
		}

		this.uiRoot = document.createElement("div");
		this.uiRoot.style.maxWidth = "480px";
		document.body.append(this.uiRoot);
		this.createUI();
	}

	update(): void {
		this.board.updateSprites();
		this.player.updateSprite();

		//Request inventory display string.
		this.inventory!.innerHTML = translation("inventory") + `:<br>` + this.player.requestInventoryContents();

		if (this.player.checkWinCon()) {
			this.win!.innerText = translation("win");
		}
	}
}

const main = () => {
	// Add application title
	document.title = APP_NAME;
	const title = document.createElement("h1");
	title.textContent = APP_NAME;
	document.body.appendChild(title);

	// Run the main scene
	new Phaser.Game({
		width: TILE_SIZE * StateManager.cols,
		height: TILE_SIZE * StateManager.rows,
		scene: MainScene,
	});
};

// Start the game
main();
