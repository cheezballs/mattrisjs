const Constants = {
    cols: 10,
    rows: 20,
    spacing: 2,
    blockSize: 33,
    previewBlockSize: 10,
    maxPieceSize: 4,

    playField: {
        x: 19,
        y: 34,
        width: 360,
        height: 720
    },

    nextPiece: {
        x: 390,
        y: 52,
        width: 91,
        height: 91
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

    textFieldStyle: {
        fontSize: "32px",
        fill: '#fff'
    },

    GameState: {
        GameOver: "GameOver",
        Running: "Running",
        Paused: "Paused"
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
		QuickDrop: "QuickDrop",
		Rotate: "Rotate"
	}

}

export default Constants;
