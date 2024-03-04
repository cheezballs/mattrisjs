const GameConstants = {
    cols: 10,
    rows: 20,
    spacing: 2,
    blockSize: 33,
    previewBlockSize: 15,
	previewCols: 4,
	previewRows: 4,
    maxPieceSize: 4,

    playField: {
        x: 19,
        y: 34,
        width: 360,
        height: 720
    },

    nextPiece: {
        x: 410,
        y: 70,
        width: 91,
        height: 91,
    },

    score: {
        x: 388,
        y: 240,
        width: 91,
        height: 52
    },

    level: {
        x: 387,
        y: 365,
        width: 91,
        height: 53
    },

    lines: {
        x: 387,
        y: 493,
        width: 91,
        height: 53
    },

	status: {
		x: 19,
		y: 365,
		width: 360,
		height: 2
	},

    textFieldStyle: {
        fontSize: "32px",
        fill: '#fff'
    },

    GameState: {
        GameOver: "GameOver",
        Running: "Running",
        Paused: "Paused",
		QuickDrop: "QuickDrop"
    },

	Colors: {
		Red: 0xff0000,
		Blue: 0x0000ff,
		Green: 0x008000,
		Yellow: 0xffff00,
		White: 0xffffff
	},

	Inputs: {
		Up: "Up",
		Down: "Down",
		Left: "Left",
		Right: "Right",
		Enter: "Enter",
		Space: "Space"
	}

}

export default GameConstants;
