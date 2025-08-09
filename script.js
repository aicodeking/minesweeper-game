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
        this.difficulty = 'easy'; // Default difficulty
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
        const gameContainer = document.querySelector('.game-container');

        if (won) {
            this.resetBtn.textContent = '😎';
            gameContainer.classList.add('game-won');

            const newHighScore = highScoreManager.updateScore(this.difficulty, this.timer);
            if (newHighScore) {
                highScoreManager.displayScores();
            }

            // Flag all mines
            for (const [row, col] of this.mineLocations) {
                if (!this.board[row][col].isFlagged) {
                    this.board[row][col].isFlagged = true;
                }
            }
        } else {
            this.resetBtn.textContent = '😵';
            gameContainer.classList.add('game-lost');
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

        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.remove('game-won', 'game-lost');
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

    game.difficulty = level;

    if (level === 'custom') {
        document.getElementById('custom-difficulty-modal').style.display = 'flex';
        return;
    }
    
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

const highScoreManager = {
    getScores: () => {
        const scores = localStorage.getItem('minesweeperHighScores');
        return scores ? JSON.parse(scores) : { easy: Infinity, medium: Infinity, hard: Infinity };
    },
    saveScores: (scores) => {
        localStorage.setItem('minesweeperHighScores', JSON.stringify(scores));
    },
    updateScore: (level, newTime) => {
        if (level === 'custom' || !level) return false;
        const scores = highScoreManager.getScores();
        if (newTime < scores[level]) {
            scores[level] = newTime;
            highScoreManager.saveScores(scores);
            return true;
        }
        return false;
    },
    displayScores: () => {
        const scores = highScoreManager.getScores();
        document.getElementById('highscore-easy').textContent = scores.easy === Infinity ? '--' : scores.easy;
        document.getElementById('highscore-medium').textContent = scores.medium === Infinity ? '--' : scores.medium;
        document.getElementById('highscore-hard').textContent = scores.hard === Infinity ? '--' : scores.hard;
    }
};

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Minesweeper();
    highScoreManager.displayScores();

    // Event listeners
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // On page load, check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark-mode') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    // Difficulty buttons
    document.querySelector('.difficulty').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const level = e.target.dataset.level;
            if (level) {
                setDifficulty(level);
            }
        }
    });

    // Custom difficulty modal
    const customModal = document.getElementById('custom-difficulty-modal');
    const startCustomBtn = document.getElementById('start-custom-game-btn');
    const cancelCustomBtn = document.getElementById('cancel-custom-game-btn');
    const errorMessage = document.getElementById('custom-error-message');

    cancelCustomBtn.addEventListener('click', () => {
        customModal.style.display = 'none';
        errorMessage.textContent = '';
    });

    startCustomBtn.addEventListener('click', () => {
        const rowsInput = document.getElementById('custom-rows');
        const colsInput = document.getElementById('custom-cols');
        const minesInput = document.getElementById('custom-mines');

        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        const mines = parseInt(minesInput.value);

        // Validation
        const maxMines = Math.floor((rows * cols) * 0.8);
        if (isNaN(rows) || isNaN(cols) || isNaN(mines)) {
            errorMessage.textContent = 'All fields must be valid numbers.';
            return;
        }
        if (rows < 5 || rows > 30 || cols < 5 || cols > 50) {
            errorMessage.textContent = 'Rows (5-30) or Columns (5-50) are out of range.';
            return;
        }
        if (mines < 1 || mines > maxMines) {
            errorMessage.textContent = `Mines must be between 1 and ${maxMines}.`;
            return;
        }

        errorMessage.textContent = '';
        game.rows = rows;
        game.cols = cols;
        game.minesCount = mines;
        game.resetGame();
        customModal.style.display = 'none';
    });
});

// created with Comet Assistant
