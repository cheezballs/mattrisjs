import GameConstants from "../constants/constants";
import GridBasedDrawable from "./grid-based-drawable";

class Playfield extends GridBasedDrawable{

    constructor(x, y, cols, rows, blockSize, spacing) {
		super(x, y, cols, rows, blockSize, spacing);
    }

    getRowsToClear(startAtRow, rowCount) {
        if (!rowCount) {
            rowCount = 4; // max piece height
        }

        let filledRows = [];
        let maxIndex = startAtRow + rowCount - 1;
        if (maxIndex > this.height - 1) {
            maxIndex = this.height - 1;
        }
        for (let rowIndex = startAtRow; rowIndex <= maxIndex; rowIndex++) {
            const rowCols = this.grid[rowIndex];
            if (this.isRowFilled(rowCols)) {
                filledRows.push(rowIndex);
            }
        }

        return filledRows;
    }

    isRowFilled(rowCols) {
        for (let x = 0; x < rowCols.length; x++) {
            if (!rowCols[x].blocked) {
                return false;
            }
        }
        return true;
    }

    destroyRows(rows) {
        for (let x = 0; x < rows.length; x++) {
            const rowIndex = rows[x];
            for (let y = 0; y < this.width; y++) {
                this.grid[rowIndex][y].blocked = false;
            }
        }
        this.collapseRows(rows);
    }

    collapseRows(rows) {
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            for (let x = rows[rowIndex]; x > 1; x--) { // dont bother with first row
                for (let celIndex = 0; celIndex < this.grid[x].length; celIndex++) {
                    this.grid[x][celIndex].blocked = this.grid[x - 1][celIndex].blocked;
                    this.grid[x][celIndex].color = this.grid[x - 1][celIndex].color;
                }
            }
        }
    }

	isValidPosition(shape, rowPosition, colPosition) {
		const shapeWidth = shape.reduce((max, current) => Math.max(max, current.length), 0);
		const shapeHeight = shape.length;

		// screen bounds
		if (colPosition < 0 || colPosition + shapeWidth > GameConstants.cols) {
			return false
		}
		if (rowPosition < 0 || rowPosition + shapeHeight > GameConstants.rows) {
			return false;
		}

		// other blocks
		for (let i = 0; i < shape.length; i++) {
			const row = shape[i];
			for (let j = 0; j < row.length; j++) {
				const cell = row[j];
				if (cell && cell === 1) {
					const backgroundCell = this.grid[rowPosition + i][colPosition + j];
					if (backgroundCell.blocked) {
						return false;
					}
				}
			}
		}
		return true;
	}
}

export default Playfield;
