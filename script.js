function gameBoard (){
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++){
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const markBoard = (row, column, player) => {
        if (board[row][column].getValue() !== 0) {
            return;
        }
        board[row][column].addToken(player);
    }

    const printBoard = () => {
        const boardState = board.map(row => 
            row.map(cell => cell.getValue() || ' ').join(' | ')
        );
        
        console.log('\n' + boardState.join('\n---------\n') + '\n');
    };

    const checkTie = () => {
        return board.every(row => row.every(cell => cell.getValue() !== 0));
    };

    // Add this to the gameBoard function
    const checkWinner = () => {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (board[i][0].getValue() !== 0 &&
                board[i][0].getValue() === board[i][1].getValue() && 
                board[i][0].getValue() === board[i][2].getValue()) {
                return board[i][0].getValue();
            }
        }

        // Check columns
        for (let i = 0; i < 3; i++) {
            if (board[0][i].getValue() !== 0 &&
                board[0][i].getValue() === board[1][i].getValue() && 
                board[0][i].getValue() === board[2][i].getValue()) {
                return board[0][i].getValue();
            }
        }

        // Check diagonals
        if (board[0][0].getValue() !== 0 &&
            board[0][0].getValue() === board[1][1].getValue() && 
            board[0][0].getValue() === board[2][2].getValue()) {
            return board[0][0].getValue();
        }

        if (board[0][2].getValue() !== 0 &&
            board[0][2].getValue() === board[1][1].getValue() && 
            board[0][2].getValue() === board[2][0].getValue()) {
            return board[0][2].getValue();
        }

        return null;
    };

    // Add checkWinner to the returned object in gameBoard
    return { getBoard, markBoard, printBoard, checkWinner, checkTie };

}


function Cell () {
    let value = 0;

    const addToken = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {addToken, getValue};
}

function gameController (
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = gameBoard();
    const players = [
        {
            name: playerOneName,
            token: "X"
        },
        {
            name: playerTwoName,
            token: "O"
        }
    ]
    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;
    const getBoard = () => board.getBoard();

    const playRound = (row, column) => {
        board.markBoard(row, column, getActivePlayer().token);

        // Check for winner
        const winner = board.checkWinner();
        console.log(winner);
        if (winner) {
            return { gameOver: true, winner: getActivePlayer() };
        }

        // Check for tie
        if (board.checkTie()) {
            return { gameOver: true, tie: true };
        }
          
        // Switch player turn
        switchPlayerTurn();
        return { gameOver: false };
    };

    return { playRound, getActivePlayer, getBoard };
}

function gameUI () {
    const setupForm = document.getElementById('setupForm');
    const gameContainer = document.getElementById('gameContainer');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');
    const startGameBtn = document.getElementById('startGame');
    const restartGameBtn = document.getElementById('restartGame');
    const playerTurnDiv = document.querySelector('.turn');
    const resultDiv = document.querySelector('.result');
    const boardDiv = document.querySelector('.board');
    
    let game;
    let isGameOver = false;

    const startGame = () => {
        const player1Name = player1Input.value.trim() || 'Player 1';
        const player2Name = player2Input.value.trim() || 'Player 2';
        
        game = gameController(player1Name, player2Name);
        isGameOver = false;
        setupForm.style.display = 'none';
        gameContainer.style.display = 'block';
        resultDiv.textContent = '';
        updateScreen();
    };

    const updateScreen = () => {
        // Update player turn display
        if (!isGameOver) {
            playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn...`;
            resultDiv.textContent = '';
        }

        // Update board
        boardDiv.textContent = '';
        const board = game.getBoard();

        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                const value = cell.getValue();
                if (value !== 0) {
                    cellButton.textContent = value;
                    cellButton.classList.add(value.toLowerCase());
                }
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = columnIndex;
                if (isGameOver) {
                    cellButton.disabled = true;
                }
                boardDiv.appendChild(cellButton);
            });
        });
    };

    function clickHandlerBoard(e) {
        if (isGameOver) return;
        
        if (e.target.classList.contains('cell')) {
            const row = parseInt(e.target.dataset.row);
            const column = parseInt(e.target.dataset.column);
            const result = game.playRound(row, column);
            
            if (result.gameOver) {
                isGameOver = true;
                if (result.winner) {
                    resultDiv.textContent = `🎉 ${result.winner.name} wins! 🎉`;
                    resultDiv.classList.add('winner-animation');
                } else {
                    resultDiv.textContent = "It's a tie!";
                }
                playerTurnDiv.textContent = '';
            }
            
            updateScreen();
        }
    }

    // Event Listeners
    startGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
    });

    restartGameBtn.addEventListener('click', () => {
        setupForm.style.display = 'block';
        gameContainer.style.display = 'none';
        player1Input.value = '';
        player2Input.value = '';
        resultDiv.classList.remove('winner-animation');
    });

    boardDiv.addEventListener('click', clickHandlerBoard);
}

// Start the game
gameUI();

