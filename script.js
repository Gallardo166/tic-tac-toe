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
const getPlayers = (function() {
    let playerOneForm = document.querySelector("form#player-1");
    let playerOneInput = document.querySelector("#player-1-name");
    let playerTwoForm = document.querySelector("form#player-2");
    let playerTwoInput = document.querySelector("#player-2-name");
    let playerOne, playerTwo;

    const createPlayers = function(e) {
        playerTwoInput.blur();
        playerOne = {name: playerOneInput.value, marker: "X", title: "Player One"};
        playerTwo = {name: playerTwoInput.value, marker: "O", title: "Player Two"};
        pubsub.emit("controlGame", playerOne, playerTwo);
        e.preventDefault();
    };

    const setPlayerOne = function() {
        setTimeout(function() {playerOneInput.focus()}, 0);
        playerOneForm.addEventListener("submit", setPlayerTwo);
    };
    
    const setPlayerTwo = function(e) {
        playerTwoInput.focus();
        playerTwoForm.addEventListener("submit", createPlayers);
        e.preventDefault();
    };

    const clearInputs = function() {
        playerOneInput.value = "";
        playerTwoInput.value = "";
    };

    pubsub.on("setPlayerOne", setPlayerOne);
    pubsub.on("clearInputs", clearInputs);
})()


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
        pubsub.emit("setPlayerOne");
    };
    
    const controlGame = function(playerOne, playerTwo) {
        pubsub.emit("createGameBoard", 3, 3);
        players = [playerOne, playerTwo];
        activePlayer = players[0];

        const placeMarker = function(e) {
            if (e.target.classList.contains("cell")) {
                if (e.target.textContent == "") {
                    e.target.textContent = activePlayer.marker;
                    currentRow = Number(e.target.classList[1].at(-1)) - 1;
                    currentColumn = Number(e.target.classList[2].at(-1)) - 1;
                    pubsub.emit("editGameBoard", activePlayer, currentRow, currentColumn);
                    document.querySelector(".alert").textContent = "";
                } else {document.querySelector(".alert").textContent = "That spot is taken!"};
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

        const stopRoundIfWin = function(e) {
            if (checkWin(gameBoard.getGameBoard()) && e.target.classList.contains("cell")) {
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
        pubsub.emit("clearInputs");
        pubsub.emit("resetGameBoard");
        eraseMarker();
        startGame();
    };

    pubsub.on("controlGame", controlGame);
    pubsub.on("restartGame", restartGame);

    startGame();

    return {checkWin};
})();