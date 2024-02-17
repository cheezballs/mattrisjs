import Mattris from "./mattris.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/favicon-32x32.png";

const config = {
	type: Phaser.AUTO,
	scale: {
		mode: Phaser.Scale.CENTER_BOTH,
		parent: "game-container",
		width: 500,
		height: 800
	},
	scene: Mattris
};

const game = new Phaser.Game(config);
