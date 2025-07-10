// Minesweeper Game JavaScript
class Minesweeper {
    constructor() {
        this.board = [];
        this.mineLocations = [];
        this.gameBoard = document.getElementById('game-board');
        this.minesLeftDisplay = document.getElementById('mines-left');
        this.timerDisplay = document.getElementById('timer');
        this.resetBtn = document.getElementById('reset-btn');
        this.gameActive = true;
        this.firstClick = true;
        this.minesCount = 10;
        this.rows = 9;
        this.cols = 9;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.createBoard();
        this.renderBoard();
        this.updateMinesDisplay();
        this.resetTimer();
    }
    
    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    createBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        this.mineLocations = [];
        let minesPlaced = 0;
        
        while (minesPlaced < this.minesCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.board[row][col].isMine && !(row === excludeRow && col === excludeCol)) {
                this.board[row][col].isMine = true;
                this.mineLocations.push([row, col]);
                minesPlaced++;
            }
        }
        
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    let count = 0;
                    for (let r = -1; r <= 1; r++) {
                        for (let c = -1; c <= 1; c++) {
                            const newRow = row + r;
                            const newCol = col + c;
                            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                                if (this.board[newRow][newCol].isMine) {
                                    count++;
                                }
                            }
                        }
                    }
                    this.board[row][col].neighborMines = count;
                }
            }
        }
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    handleCellClick(e, row, col) {
        e.preventDefault();
        if (!this.gameActive || this.board[row][col].isFlagged || this.board[row][col].isRevealed) {
            return;
        }
        
        if (this.firstClick) {
            this.placeMines(row, col);
            this.startTimer();
            this.firstClick = false;
        }
        
        this.revealCell(row, col);
        this.updateDisplay();
        this.checkWinCondition();
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        if (!this.gameActive || this.board[row][col].isRevealed) {
            return;
        }
        
        this.board[row][col].isFlagged = !this.board[row][col].isFlagged;
        this.updateDisplay();
        this.updateMinesDisplay();
    }
    
    revealCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        this.board[row][col].isRevealed = true;
        
        if (this.board[row][col].isMine) {
            this.gameOver(false);
            return;
        }
        
        if (this.board[row][col].neighborMines === 0) {
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    this.revealCell(row + r, col + c);
                }
            }
        }
    }
    
    updateDisplay() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const cellData = this.board[row][col];
                
                cell.className = 'cell';
                cell.textContent = '';
                
                if (cellData.isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                } else if (cellData.isRevealed) {
                    cell.classList.add('revealed');
                    if (cellData.isMine) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (cellData.neighborMines > 0) {
                        cell.textContent = cellData.neighborMines;
                        cell.classList.add(`number-${cellData.neighborMines}`);
                    }
                }
            }
        }
    }
    
    updateMinesDisplay() {
        const flaggedCount = this.board.flat().filter(cell => cell.isFlagged).length;
        this.minesLeftDisplay.textContent = this.minesCount - flaggedCount;
    }
    
    checkWinCondition() {
        let revealedCells = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isRevealed && !this.board[row][col].isMine) {
                    revealedCells++;
                }
            }
        }
        
        const totalNonMineCells = this.rows * this.cols - this.minesCount;
        if (revealedCells === totalNonMineCells) {
            this.gameOver(true);
        }
    }
    
    gameOver(won) {
        this.gameActive = false;
        this.stopTimer();
        
        if (won) {
            this.resetBtn.textContent = '😎';
            // Flag all mines
            for (const [row, col] of this.mineLocations) {
                if (!this.board[row][col].isFlagged) {
                    this.board[row][col].isFlagged = true;
                }
            }
        } else {
            this.resetBtn.textContent = '😵';
            // Reveal all mines
            for (const [row, col] of this.mineLocations) {
                this.board[row][col].isRevealed = true;
            }
        }
        
        this.updateDisplay();
        this.updateMinesDisplay();
    }
    
    resetGame() {
        this.gameActive = true;
        this.firstClick = true;
        this.resetBtn.textContent = '😊';
        this.stopTimer();
        this.initializeGame();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer.toString().padStart(3, '0');
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.timer = 0;
        this.timerDisplay.textContent = '000';
    }
}

// Difficulty settings
function setDifficulty(level) {
    let rows, cols, mines;
    
    switch (level) {
        case 'easy':
            rows = 9;
            cols = 9;
            mines = 10;
            break;
        case 'medium':
            rows = 16;
            cols = 16;
            mines = 40;
            break;
        case 'hard':
            rows = 16;
            cols = 30;
            mines = 99;
            break;
    }
    
    game.rows = rows;
    game.cols = cols;
    game.minesCount = mines;
    game.resetGame();
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Minesweeper();
});

// created with Comet Assistant
