class NextPieceDisplay {

    constructor(x, y, cols, rows, blockSize, spacing) {
        this.x = x;
        this.y = y;
        this.width = cols;
        this.height = rows;
        this.blockSize = blockSize;
        this.spacing = spacing;
        this.grid = this.createEmptyGrid();
    }

    createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < this.height; row++) {
            const rowArray = [];
            const yPos = (row * this.blockSize) + (row * this.spacing) + this.y + this.spacing;
            for (let col = 0; col < this.width; col++) {
                const xPos = (col * this.blockSize) + (col * this.spacing) + this.x + this.spacing;
                rowArray.push({blocked: false, x: xPos, y: yPos});
            }
            grid.push(rowArray);
        }
        return grid;
    }

    setNewPiece(piece) {
        this.piece = piece;
    }

    draw(graphics) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const cell = this.grid[row][col];
                if (cell.blocked) {
                    graphics.fillStyle(this.piece.color, 1);
                    graphics.fillRect(cell.x, cell.y, this.blockSize, this.blockSize);
                }
            }
        }
    }

}

export default NextPieceDisplay;
