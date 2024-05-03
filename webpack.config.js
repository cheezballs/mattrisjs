const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/main.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "mattris.js",
	},
	resolve: {
		alias: {
			phaser: "phaser"
		}
	},
	devServer: {
		compress: true,
		port: 9000,
		hot: true
	},
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|svg|mp3)$/i,
				loader: "file-loader",
				options: {
					name: "[name].[ext]",
					outputPath: "assets/",
					publicPath: "assets/"
				}
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		}),
	],
};
