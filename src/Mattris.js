import Phaser from 'phaser';
import Playfield from "./Playfield";
import Pieces from "./Pieces";
import Colors from "./Colors";
import {findGravityForLines} from "./GravityBreakpoints";
import NextPieceDisplay from "./NextPieceDisplay";
import Constants from "./Constants";

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
        this.load.image("background", "../assets/background.png");
    }

    create() {
        this.graphics = this.add.graphics().setDepth(1);
        this.createBackground();
        this.createStatGraphics();
        this.createControls();
        this.resetGame();
    }

    update(time, delta) {
        this.handleInput();
        this.drawStats();
        this.graphics.clear();
        this.drawPlayfield();
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

    drawPlayfield() {
        this.playfield.draw(this.graphics);
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

    createControls() {
        const keyInput = this.input.keyboard;
        this.keyLeft = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keyDown = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keyUp = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyEnter = keyInput.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    handleInput() {
        if (Phaser.Input.Keyboard.JustDown(this.keyEnter)) {
            if (this.gameState === GameState.GameOver) {
                this.newGame();
            } else {
                this.togglePause();
            }
        }
        if (Constants.GameState.Running === this.gameState) {
            const currentShape = this.activePiece.shapes[this.activePiece.rotation];
            const piece = this.activePiece;

            if (Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
                if (this.isValidPosition(currentShape, piece.rowPosition, piece.colPosition - 1)) {
                    piece.colPosition -= 1;
                }
            }

            if (Phaser.Input.Keyboard.JustDown(this.keyRight)) {
                if (this.isValidPosition(currentShape, piece.rowPosition, piece.colPosition + 1)) {
                    piece.colPosition += 1;
                }
            }

            if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
                const nextShape = piece.shapes[this.peekNextRotation()];
                if (this.isValidPosition(nextShape, piece.rowPosition, piece.colPosition)) {
                    this.activePiece.rotation = this.peekNextRotation();
                }
            }

            if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
                this.handleDrop(currentShape, piece);
            }

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
        let scoreToAdd = 0;
        if (rowsToClear) {
            for (let x = 0; x < rowsToClear.length; x++) {
                scoreToAdd += 10; // todo: multiplier
            }
            this.playfield.destroyRows(rowsToClear);
        }
        this.scoreVal += scoreToAdd;
    }

    gravityDrop() {
        const currentShape = this.activePiece.shapes[this.activePiece.rotation];
        const piece = this.activePiece;
        this.handleDrop(currentShape, piece);

        // increment lines
        // increment score
        // set level val equal to the breakpoint index for the line
    }

    drawStats() {
        this.scoreText.text = this.scoreVal;
        this.linesText.text = this.linesVal;
        this.levelText.text = this.levelVal;
    }

    newGame() {
        this.resetGame();
        this.activePiece = this.getNewActivePiece();
        this.nextPiece = this.getRandomPiece();
        this.nextPieceDisplay.piece = this.nextPiece;
        this.gameState = Constants.GameState.Running;
        this.gravityTimer.paused = false;
    }

    togglePause() {
        this.gameState = this.gameState === Constants.GameState.Paused ? this.gameState = Constants.GameState.Running : Constants.GameState.Paused;
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
        const colorIndex = Phaser.Math.Between(0, Object.keys(Colors).length - 1);
        const randColor = Object.values(Colors)[colorIndex];

        return {
            shapes: pieceShapes,
            color: randColor,
            type: pieceType
        }
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
    }

    createBackground() {
        let bg = this.add.image(0, 0, "background").setOrigin(0, 0).setDepth(0);
        bg.displayWidth = this.sys.canvas.width;
        bg.displayHeight = this.sys.canvas.height;
    }
}