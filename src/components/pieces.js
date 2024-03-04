import Phaser from "phaser";
import GameConstants from "../constants/constants";

const Pieces = {
    I:
        [
            [
                [1, 1, 1, 1]
            ],
            [
                [1],
                [1],
                [1],
                [1]
            ]
        ],
    J:
        [
            [
                [0, 1],
                [0, 1],
                [1, 1]
            ],
            [
                [1],
                [1, 1, 1]
            ],
            [
                [1, 1],
                [1],
                [1]
            ],
            [
                [1, 1, 1],
                [0, 0, 1]
            ]
        ],
    L:
        [
            [
                [1],
                [1],
                [1, 1]
            ],
            [
                [0, 0, 1],
                [1, 1, 1]
            ],
            [
                [1, 1],
                [0, 1],
                [0, 1]
            ],
            [
                [1, 1, 1],
				[1]
            ]
        ],
    O:
        [
            [
                [1, 1],
                [1, 1]
            ]
        ],
    S:
        [
            [
                [0, 1, 1],
                [1, 1]
            ],
            [
                [1],
                [1, 1],
                [0, 1]
            ]
        ],
    T:
        [
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1],
                [1, 1],
                [0, 1]
            ],
            [
                [0, 1],
                [1, 1, 1],
            ],
            [
                [1],
                [1, 1],
                [1]
            ]
        ],
    Z:
        [
            [
                [1, 1],
                [0, 1, 1]
            ],
            [
                [0, 1,],
                [1, 1,],
                [1, 0,]
            ]
        ]
}

const getRandomPiece = () => {
	const pieceIndex = Phaser.Math.Between(0, Object.keys(Pieces).length - 1);
	const pieceType = Object.keys(Pieces)[pieceIndex];
	const pieceShapes = Object.values(Pieces)[pieceIndex];
	const colorIndex = Phaser.Math.Between(0, Object.keys(GameConstants.Colors).length - 1);
	const randColor = Object.values(GameConstants.Colors)[colorIndex];

	return {
		shapes: pieceShapes,
		color: randColor,
		type: pieceType
	}
}

export {Pieces, getRandomPiece}
