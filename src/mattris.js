import Phaser from "phaser";
import Playfield from "./components/playfield.js";
import Pieces from "./components/pieces.js";
import {findGravityForLines} from "./components/gravity-breakpoints";
import NextPieceDisplay from "./components/next-piece-display.js";
import Constants from "./constants/Constants.js";
import backgroundImage from "./assets/background.png";

export default class Mattris extends Phaser.Scene {

	constructor() {
		super("Mattris");
		this.graphics = null;
		this.timerConfig = {
			delay: 1000 * findGravityForLines(this.linesVal),
			callback: this.gravityDrop,
			callbackScope: this,
			loop: true,
			paused: true
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
		this.drawNextPiece();
	}

	resetGame() {
		this.scoreVal = 0;
		this.linesVal = 0;
		this.levelVal = 0;
		this.playfield = new Playfield(Constants.playField.x, Constants.playField.y, Constants.cols, Constants.rows, Constants.blockSize, Constants.spacing);
		this.nextPieceDisplay = new NextPieceDisplay(Constants.nextPiece.x, Constants.nextPiece.y, Constants.maxPieceSize, Constants.maxPieceSize, Constants.previewBlockSize);
		this.activePiece = null;
		this.nextPiece = null;
		this.gameState = Constants.GameState.GameOver;

		this.gravityTimer = this.time.addEvent(this.timerConfig);
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
						this.graphics.fillRect(backgroundCell.x, backgroundCell.y, Constants.blockSize, Constants.blockSize);
					}
				}
			}
		}
	}

	drawNextPiece() {
		if (this.nextPiece) {
			this.nextPieceDisplay.draw(this.graphics);
		}
	}

	isValidPosition(shape, rowPosition, colPosition) {
		const shapeWidth = shape.reduce((max, current) => Math.max(max, current.length), 0);
		const shapeHeight = shape.length;

		// screen bounds
		if (colPosition < 0 || colPosition + shapeWidth > Constants.cols) {
			return false
		}
		if (rowPosition < 0 || rowPosition + shapeHeight > Constants.rows) {
			return false;
		}

		// other blocks
		for (let i = 0; i < shape.length; i++) {
			const row = shape[i];
			for (let j = 0; j < row.length; j++) {
				const cell = row[j];
				if (cell && cell === 1) {
					const backgroundCell = this.playfield.grid[rowPosition + i][colPosition + j];
					if (backgroundCell.blocked) {
						return false;
					}
				}
			}
		}
		return true;
	}

	peekNextRotation() {
		const nextRotation = this.activePiece.rotation + 1;
		if (nextRotation > this.activePiece.maxRotation) {
			return 0;
		} else {
			return nextRotation;
		}
	}

	handleFastDrop(currentShape, piece) {

	}

	handleDrop(currentShape, piece) {
		if (this.isValidPosition(currentShape, piece.rowPosition + 1, piece.colPosition)) {
			piece.rowPosition += 1;
		} else {
			this.playfield.blockCells(currentShape, piece.rowPosition, piece.colPosition, this.activePiece.color);
			const rowsToClear = this.playfield.getRowsToClear(piece.rowPosition, currentShape.length);
			this.scoreRows(rowsToClear);
			this.cycleActivePiece();
		}
		this.gravityTimer.reset(this.timerConfig);
		this.gravityTimer.paused = false;
	}

	scoreRows(rowsToClear) {
		if (rowsToClear.length > 0) {
			this.scoreVal += this.calculateScore(rowsToClear.length);
			this.playfield.destroyRows(rowsToClear);
			this.linesVal += rowsToClear.length;
			this.levelVal = Math.floor(this.linesVal / 10) + 1;
		}
	}

	calculateScore(rows) {
		let multiplier;
		switch (rows) {
			case 1:
				multiplier = 4;
				break;
			case 2:
				multiplier = 10;
				break;
			case 3:
				multiplier = 30;
				break;
			case 4:
				multiplier = 120;
				break;
			default:
				multiplier = 1;
		}
		return this.levelVal * multiplier;
	}

	gravityDrop() {
		const currentShape = this.activePiece.shapes[this.activePiece.rotation];
		this.handleDrop(currentShape, this.activePiece);
	}

	playerDrop() {
		const currentShape = this.activePiece.shapes[this.activePiece.rotation];
		this.handleDrop(currentShape, this.activePiece);
	}

	drawStats() {
		this.scoreText.text = this.scoreVal;
		this.linesText.text = this.linesVal;
		this.levelText.text = this.levelVal;

		if(Constants.GameState.Running === this.gameState) {
			this.statusText.text = "Running";
			this.statusText.visible = false;
		} else {
			if(Constants.GameState.GameOver === this.gameState) {
				this.statusText.text = "Press Enter To Start";
			} else if (Constants.GameState.Paused === this.gameState) {
				this.statusText.text = "Paused";
			}
			this.statusText.visible = true;
		}
	}

	newGame() {
		this.resetGame();
		this.activePiece = this.getNewActivePiece();
		this.nextPiece = this.getRandomPiece();
		this.nextPieceDisplay.piece = this.nextPiece;
		this.gameState = Constants.GameState.Running;
		this.gravityTimer.paused = false;
		this.levelVal = 1;
		this.scoreVal = 0;
	}

	togglePause() {
		this.gameState = this.gameState === Constants.GameState.Paused ? Constants.GameState.Running : Constants.GameState.Paused;
	}

	getNewActivePiece() {
		let piece = this.getRandomPiece();
		piece.colPosition = Constants.cols / 2;
		piece.rowPosition = 0;
		piece.rotation = 0;
		piece.maxRotation = piece.shapes.length - 1;
		return piece;
	}

	cycleActivePiece() {
		let piece = {...this.nextPiece};
		piece.colPosition = Constants.cols / 2;
		piece.rowPosition = 0;
		piece.rotation = 0;
		piece.maxRotation = piece.shapes.length - 1;
		this.activePiece = piece;
		this.nextPiece = this.getRandomPiece();
		this.nextPieceDisplay.piece = this.nextPiece;
	}

	getRandomPiece() {
		const pieceIndex = Phaser.Math.Between(0, Object.keys(Pieces).length - 1);
		const pieceType = Object.keys(Pieces)[pieceIndex];
		const pieceShapes = Object.values(Pieces)[pieceIndex];
		const colorIndex = Phaser.Math.Between(0, Object.keys(Constants.Colors).length - 1);
		const randColor = Object.values(Constants.Colors)[colorIndex];

		return {
			shapes: pieceShapes,
			color: randColor,
			type: pieceType
		}
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

	handleInput(input) {
		if(this.gameState === Constants.GameState.Running) {
			const currentShape = this.activePiece.shapes[this.activePiece.rotation];
			if (input === Constants.Inputs.Down) {
				this.playerDrop();
			}
			if (input === Constants.Inputs.Enter) {
				this.togglePause();
			}
			if (input === Constants.Inputs.Left) {
				if (this.isValidPosition(currentShape, this.activePiece.rowPosition, this.activePiece.colPosition - 1)) {
					this.activePiece.colPosition -= 1;
				}
			}
			if (input === Constants.Inputs.Right) {
				if (this.isValidPosition(currentShape, this.activePiece.rowPosition, this.activePiece.colPosition + 1)) {
					this.activePiece.colPosition += 1;
				}
			}
			if (input === Constants.Inputs.Up) {
				const nextRotation = this.peekNextRotation();
				if (this.isValidPosition(this.activePiece.shapes[nextRotation], this.activePiece.rowPosition, this.activePiece.colPosition)) {
					this.activePiece.rotation = nextRotation;
				}
			}
		} else if(this.gameState === Constants.GameState.GameOver) {
			if (input === Constants.Inputs.Enter) {
				this.newGame();
			}
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
			this.handleDelayedRepeatingDown(Constants.Inputs.Down);
		});

		this.keyDown.on('up', () => {
			this.handleUp(Constants.Inputs.Down);
		});

		this.keyUp.on('down', () => {
			this.handleOncePerDown(Constants.Inputs.Up);
		});

		this.keyUp.on('up', () => {
			this.handleUp(Constants.Inputs.Up);
		});

		this.keyEnter.on('up', () => {
			this.handleInput(Constants.Inputs.Enter)
		});

		this.keyLeft.on('down', () => {
			this.handleDelayedRepeatingDown(Constants.Inputs.Left);
		});

		this.keyLeft.on('up', () => {
			this.handleUp(Constants.Inputs.Left);
		});

		this.keyRight.on('down', () => {
			this.handleDelayedRepeatingDown(Constants.Inputs.Right);
		});

		this.keyRight.on('up', () => {
			this.handleUp(Constants.Inputs.Right);
		});
	}

	createCenteredTextElement(textElement) {
		const scoreOriginX = ((2 * textElement.x) + textElement.width) / 2;
		const scoreOriginY = ((2 * textElement.y) + textElement.height) / 2;
		let scoreText = this.add.text(scoreOriginX, scoreOriginY, "", Constants.textFieldStyle);
		scoreText.setOrigin(.5);
		return scoreText;
	}

	createStatGraphics() {
		this.scoreText = this.createCenteredTextElement(Constants.score);
		this.linesText = this.createCenteredTextElement(Constants.lines);
		this.levelText = this.createCenteredTextElement(Constants.level);
		this.statusText = this.createCenteredTextElement(Constants.status);
		this.statusText.setFontSize(18);
	}

	createBackground() {
		let bg = this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(0);
		bg.displayWidth = this.sys.canvas.width;
		bg.displayHeight = this.sys.canvas.height;
	}
}
