var pubsub = {
    events: {},
    emit: function(eventName, dataOne, dataTwo, dataThree) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((fn) => fn(dataOne, dataTwo, dataThree));
        };
    },
    on: function(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
};

//module for game board
const gameBoard = (function() {
    var gameBoard = {board: []};

    const createGameBoard = function(rows, columns) {
        for (i=0; i<rows; i++) {
            gameBoard.board.push([]);
            for (j=0; j<columns; j++) {
                gameBoard.board[i].push("");
            };
        };
        gameBoard.rows = rows;
        gameBoard.columns = columns;
    };

    const editGameBoard = function(activePlayer, row, column) {
        gameBoard.board[row][column] = activePlayer.marker;
        console.log(gameBoard.board);
    };

    const resetGameBoard = function() {
        gameBoard = {board: []};
    };

    const getGameBoard = () => gameBoard;

    pubsub.on("createGameBoard", createGameBoard);
    pubsub.on("editGameBoard", editGameBoard);
    pubsub.on("resetGameBoard", resetGameBoard);

    return {getGameBoard};
})();

//factory function for player
function createPlayer (marker, title) {
    name = prompt(`What is the ${title}'s name?`);
    return {name, marker, title};
};

//gameOver module
const gameOver = (function() {
    dialog = document.querySelector("#play-again-dialog");
    winner = document.querySelector("#winner");
    confirmButton = document.querySelector("#ok-button");

    const openGameOver = function(activePlayer) {
        winner.textContent = `${activePlayer} is the winner!`
        dialog.showModal();
    };

    const confirmRestart = function() {
        confirmButton.addEventListener("click", (e) => {
            pubsub.emit("restartGame");
        });
    };

    pubsub.on("openGameOver", openGameOver)
    confirmRestart();
})();

const ticTacToeGame = (function() {

    const startGame = function() {
        controlGame();
    };
    
    const controlGame = function() {
        pubsub.emit("createGameBoard", 3, 3)
        let firstPlayer = createPlayer("X", "Player 1");
        let secondPlayer = createPlayer("O", "Player 2");
        players = [firstPlayer, secondPlayer];
        activePlayer = players[0];

        const placeMarker = function(e) {
            if (e.target.classList.contains("cell")) {
                if (e.target.textContent == "") {
                    e.target.textContent = activePlayer.marker;
                    currentRow = Number(e.target.classList[1].at(-1)) - 1;
                    currentColumn = Number(e.target.classList[2].at(-1)) - 1;
                    pubsub.emit("editGameBoard", activePlayer, currentRow, currentColumn);
                } else {alert("This spot is taken!")};
            };
        };
        const enablePlaceMarker = function() {
                document.body.addEventListener("click", placeMarker, false);
        };
        const switchPlayer = function(e) {
            if (e.target.classList.contains("cell") && e.target.textContent == activePlayer.marker) {
                (activePlayer == players[0]) ? activePlayer = players[1] : activePlayer = players[0];
            };
        };
        const enableSwitchPlayer = function() {
            document.body.addEventListener("click", switchPlayer, false);
        };

        const stopRoundIfWin = function() {
            if (checkWin(gameBoard.getGameBoard())) {
                pubsub.emit("openGameOver", (activePlayer == players[0]) ? players[1].name : players[0].name);
                document.body.removeEventListener("click", placeMarker, false);
                document.body.removeEventListener("click", switchPlayer, false);
            };
        };

        enablePlaceMarker();
        enableSwitchPlayer();

        document.body.addEventListener("click", stopRoundIfWin, false);
    };
    
    const checkWin = function(gameBoard) {
        let win = false;
        for (let i=0; i<gameBoard.rows; i++) {
            if (!win) {
                win = gameBoard.board[i].every((element) => ((element === gameBoard.board[i][0]) && (gameBoard.board[i][0] == "X" || gameBoard.board[i][0] == "O")));
            };
        };
        if (!win) {
            for (let i=0; i<gameBoard.columns; i++) {
                if (!win) {
                    win = gameBoard.board.every((element) => ((element[i] === gameBoard.board[0][i]) && (gameBoard.board[0][i] == "X" || gameBoard.board[0][i] == "O")));
                };
            };
        };
        if (!win) {win = gameBoard.board.every((element) => (element[gameBoard.board.indexOf(element)] === gameBoard.board[1][1]) && (gameBoard.board[1][1] == "X" || gameBoard.board[1][1] == "O"));};
        if (!win) {win = gameBoard.board.every((element) => (element[gameBoard.rows - 1 - gameBoard.board.indexOf(element)] === gameBoard.board[1][1])  && (gameBoard.board[1][1] == "X" || gameBoard.board[1][1] == "O"));};
        return win;
    };

    const eraseMarker = function() {
        let board = document.querySelectorAll(".cell");
        Array.from(board).forEach(element => element.textContent = "");
    };

    const restartGame = function() {
        pubsub.emit("resetGameBoard");
        eraseMarker();
        startGame();
    };

    pubsub.on("restartGame", restartGame);

    startGame();
})();