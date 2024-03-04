import Phaser from "phaser";
import Playfield from "./components/playfield.js";
import {getRandomPiece} from "./components/pieces.js";
import {findGravityForLines} from "./components/gravity-breakpoints";
import NextPieceDisplay from "./components/next-piece-display.js";
import backgroundImage from "./assets/background.png";
import {calculateScore} from "./components/score";
import GameConstants from "./constants/constants";

export default class Mattris extends Phaser.Scene {

	constructor() {
		super("Mattris");
		this.graphics = null;
		this.gravityTimerConfig = {
			delay: 1000 * findGravityForLines(this.linesVal),
			callback: this.gravityDrop,
			callbackScope: this,
			loop: true,
			paused: true
		};
		this.quickDropTimerConfig = {
			...this.gravityTimerConfig,
			delay: 30,
		};
	}

	preload() {
		this.load.image("background", backgroundImage);
	}

	create() {
		this.graphics = this.add.graphics().setDepth(1);
		this.createBackground();
		this.createStatGraphics();
		this.createControls();
		this.resetGame();
	}

	update(time, delta) {
		this.handleInput(delta);
		this.drawStats();
		this.graphics.clear();
		this.playfield.draw(this.graphics);
		this.drawActivePiece();
		this.nextPieceDisplay.draw(this.graphics);
	}

	drawActivePiece() {
		if (this.activePiece) {
			const rotation = this.activePiece.rotation;
			const pieceShape = this.activePiece.shapes[rotation];
			for (let i = 0; i < pieceShape.length; i++) {
				const row = pieceShape[i];
				for (let j = 0; j < row.length; j++) {
					const cell = row[j];
					if (cell && cell === 1) {
						const backgroundCell = this.playfield.grid[this.activePiece.rowPosition + i][this.activePiece.colPosition + j];
						this.graphics.fillStyle(this.activePiece.color, 1);
						this.graphics.fillRect(backgroundCell.x, backgroundCell.y, GameConstants.blockSize, GameConstants.blockSize);
					}
				}
			}
		}
	}

	resetGame() {
		this.scoreVal = 0;
		this.linesVal = 0;
		this.levelVal = 0;
		this.playfield = new Playfield(GameConstants.playField.x, GameConstants.playField.y, GameConstants.cols, GameConstants.rows, GameConstants.blockSize, GameConstants.spacing);
		this.nextPieceDisplay = new NextPieceDisplay(GameConstants.nextPiece.x, GameConstants.nextPiece.y, GameConstants.maxPieceSize, GameConstants.maxPieceSize, GameConstants.previewBlockSize);
		this.activePiece = null;
		this.nextPiece = null;
		this.gameState = GameConstants.GameState.GameOver;
		this.gravityTimer = this.time.addEvent(this.gravityTimerConfig);
	}

	newGame() {
		this.resetGame();
		this.activePiece = this.getNewActivePiece();
		this.nextPiece = getRandomPiece();
		this.nextPieceDisplay.piece = this.nextPiece;
		this.gameState = GameConstants.GameState.Running;
		this.gravityTimer.paused = false;
		this.levelVal = 1;
		this.scoreVal = 0;
	}

	getNewActivePiece() {
		let piece = getRandomPiece();
		this.setDefaultPosition(piece);
		return piece;
	}

	cycleActivePiece() {
		let piece = {...this.nextPiece};
		this.setDefaultPosition(piece);
		this.activePiece = piece;
		this.nextPiece = getRandomPiece();
		this.nextPieceDisplay.piece = this.nextPiece;
	}

	setDefaultPosition(piece) {
		piece.colPosition = GameConstants.cols / 2;
		piece.rowPosition = 0;
		piece.rotation = 0;
		piece.maxRotation = piece.shapes.length - 1;
	}

	peekNextRotation() {
		const nextRotation = this.activePiece.rotation + 1;
		if (nextRotation > this.activePiece.maxRotation) {
			return 0;
		} else {
			return nextRotation;
		}
	}

	gravityDrop() {
		const currentShape = this.activePiece.shapes[this.activePiece.rotation];
		this.handleDrop(currentShape, this.activePiece);
	}

	playerDrop() {
		const currentShape = this.activePiece.shapes[this.activePiece.rotation];
		this.handleDrop(currentShape, this.activePiece);
		this.gravityTimer.reset(this.gravityTimerConfig);
		this.gravityTimer.paused = false;
	}

	handleDrop(currentShape, piece) {
		if (this.playfield.isValidPosition(currentShape, piece.rowPosition + 1, piece.colPosition)) {
			piece.rowPosition += 1;
		} else {
			this.playfield.blockCells(currentShape, piece.rowPosition, piece.colPosition, this.activePiece.color);
			const rowsToClear = this.playfield.getRowsToClear(piece.rowPosition, currentShape.length);
			this.scoreRows(rowsToClear);
			this.cycleActivePiece();
			this.gravityTimer.reset(this.gravityTimerConfig);
			this.gravityTimer.paused = false;
			this.gameState = GameConstants.GameState.Running;
		}
	}

	scoreRows(rowsToClear) {
		if (rowsToClear.length > 0) {
			this.scoreVal += calculateScore(rowsToClear.length, this.levelVal);
			this.playfield.destroyRows(rowsToClear);
			this.linesVal += rowsToClear.length;
			this.levelVal = Math.floor(this.linesVal / 10) + 1;
		}
	}

	drawStats() {
		this.scoreText.text = this.scoreVal;
		this.linesText.text = this.linesVal;
		this.levelText.text = this.levelVal;

		if(GameConstants.GameState.Running === this.gameState) {
			this.statusText.text = "Running";
			this.statusText.visible = false;
		} else {
			if(GameConstants.GameState.GameOver === this.gameState) {
				this.statusText.text = "Press Enter To Start";
			} else if (GameConstants.GameState.Paused === this.gameState) {
				this.statusText.text = "Paused";
			}
			this.statusText.visible = true;
		}
	}

	handleInput(input) {
		if(this.gameState === GameConstants.GameState.Running) {
			const currentShape = this.activePiece.shapes[this.activePiece.rotation];
			if (input === GameConstants.Inputs.Down) {
				this.playerDrop();
			}
			if (input === GameConstants.Inputs.Enter) {
				this.gameState = GameConstants.GameState.Paused;
				this.gravityTimer.paused = true;
			}
			if (input === GameConstants.Inputs.Left) {
				if (this.playfield.isValidPosition(currentShape, this.activePiece.rowPosition, this.activePiece.colPosition - 1)) {
					this.activePiece.colPosition -= 1;
				}
			}
			if (input === GameConstants.Inputs.Right) {
				if (this.playfield.isValidPosition(currentShape, this.activePiece.rowPosition, this.activePiece.colPosition + 1)) {
					this.activePiece.colPosition += 1;
				}
			}
			if (input === GameConstants.Inputs.Up) {
				const nextRotation = this.peekNextRotation();
				if (this.playfield.isValidPosition(this.activePiece.shapes[nextRotation], this.activePiece.rowPosition, this.activePiece.colPosition)) {
					this.activePiece.rotation = nextRotation;
				}
			}
			if (input === GameConstants.Inputs.Space) {
				this.initiateQuickDrop();
			}
		} else if(this.gameState === GameConstants.GameState.GameOver) {
			if (input === GameConstants.Inputs.Enter) {
				this.newGame();
			}
		} else if(this.gameState === GameConstants.GameState.QuickDrop) {
			// do nothing yet
		} else if(this.gameState === GameConstants.GameState.Paused) {
			if (input === GameConstants.Inputs.Enter) {
				this.gameState = GameConstants.GameState.Running;
				this.gravityTimer.paused = false;
			}
		}
	}

	initiateQuickDrop() {
		this.gravityTimer.reset(this.quickDropTimerConfig);
		this.gravityTimer.paused = false;
	}

	handleDelayedRepeatingDown(input) {
		if (this.keyTimer != null) {
			this.keyTimer.remove();
		}
		this.handleInput(input);
		this.keyTimer = this.time.addEvent({
			delay: 200,
			callback: () => this.handleInput(input),
			loop: true
		});
	}

	handleOncePerDown(input) {
		if(!this.keyEventFired) {
			this.handleInput(input)
			this.keEventFired = true;
		}
	}

	handleUp(input) {
		if (this.keyTimer != null) {
			this.keyTimer.remove();
			this.keyTimer = null;
		}
		if(this.keEventFired) {
			this.keyEventFired = false;
		}
	}

	createControls() {
		const keyInput = this.input.keyboard;
		this.keyLeft = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.keyRight = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.keyDown = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.keyUp = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.keyEnter = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		this.keySpace = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		this.keyDown.on('down', () => {
			this.handleDelayedRepeatingDown(GameConstants.Inputs.Down);
		});

		this.keyDown.on('up', () => {
			this.handleUp(GameConstants.Inputs.Down);
		});

		this.keyUp.on('down', () => {
			this.handleOncePerDown(GameConstants.Inputs.Up);
		});

		this.keyUp.on('up', () => {
			this.handleUp(GameConstants.Inputs.Up);
		});

		this.keyEnter.on('up', () => {
			this.handleInput(GameConstants.Inputs.Enter)
		});

		this.keyLeft.on('down', () => {
			this.handleDelayedRepeatingDown(GameConstants.Inputs.Left);
		});

		this.keyLeft.on('up', () => {
			this.handleUp(GameConstants.Inputs.Left);
		});

		this.keyRight.on('down', () => {
			this.handleDelayedRepeatingDown(GameConstants.Inputs.Right);
		});

		this.keyRight.on('up', () => {
			this.handleUp(GameConstants.Inputs.Right);
		});

		this.keySpace.on('down', () => {
			this.handleOncePerDown(GameConstants.Inputs.Space);
		});

		this.keySpace.on('up', () => {
			this.handleUp(GameConstants.Inputs.Space);
		});
	}

	createCenteredTextElement(textElement) {
		const scoreOriginX = ((2 * textElement.x) + textElement.width) / 2;
		const scoreOriginY = ((2 * textElement.y) + textElement.height) / 2;
		let scoreText = this.add.text(scoreOriginX, scoreOriginY, "", GameConstants.textFieldStyle);
		scoreText.setOrigin(.5);
		return scoreText;
	}

	createStatGraphics() {
		this.scoreText = this.createCenteredTextElement(GameConstants.score);
		this.linesText = this.createCenteredTextElement(GameConstants.lines);
		this.levelText = this.createCenteredTextElement(GameConstants.level);
		this.statusText = this.createCenteredTextElement(GameConstants.status);
		this.statusText.setFontSize(18);
	}

	createBackground() {
		let bg = this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(0);
		bg.displayWidth = this.sys.canvas.width;
		bg.displayHeight = this.sys.canvas.height;
	}
}
