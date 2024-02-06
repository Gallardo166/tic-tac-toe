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

    const getGameBoard = () => gameBoard;

    pubsub.on("createGameBoard", createGameBoard);
    pubsub.on("editGameBoard", editGameBoard);

    return {getGameBoard};
})();

//factory function for player
function createPlayer (marker, title) {
    name = prompt(`What is the ${title}'s name?`);
    return {name, marker, title};
};

//module for game flow
const ticTacToeGame = (function() {
    let firstPlayer = createPlayer("X", "Player 1");
    let secondPlayer = createPlayer("O", "Player 2");
    let players = [firstPlayer, secondPlayer];
    let activePlayer = players[0];
    let valid = false;

    pubsub.emit("createGameBoard", 3, 3);

    const initRound = function() {
        document.body.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("cell")) {
                enableCheckWin();
                if (!checkWin(gameBoard.getGameBoard())) {
                    enablePlaceMarker();
                    enableSwitchPlayer();
                } else {
                    disablePlaceMarker();
                    disableSwitchPlayer();
                };
                console.log(checkWin(gameBoard.getGameBoard()));
            };
        });
    };

    const placeMarker = (e) => {
        if (e.target.classList.contains("cell")) {
            if (e.target.textContent == "") {
                e.target.textContent = activePlayer.marker;
                currentRow = Number(e.target.classList[1].at(-1)) - 1;
                currentColumn = Number(e.target.classList[2].at(-1)) - 1;
                pubsub.emit("editGameBoard", activePlayer, currentRow, currentColumn);
                valid = true;
            } else {
                alert("This spot is taken!");
                valid = false;
            };
        };
    }; 

    const switchPlayer = function(e) {
        if (e.target.classList.contains("cell") && valid) {
            (activePlayer == players[0]) ? activePlayer = players[1] : activePlayer = players[0];
        };
    };

    function checkWin() {
        let win = false;
        for (let i=0; i<gameBoard.getGameBoard().rows; i++) {
            if (!win) {
                win = gameBoard.getGameBoard().board[i].every((element) => ((element === gameBoard.getGameBoard().board[i][0]) && (gameBoard.getGameBoard().board[i][0] == "X" || gameBoard.getGameBoard().board[i][0] == "O")));
            };
        };
        if (!win) {
            for (let i=0; i<gameBoard.getGameBoard().columns; i++) {
                if (!win) {
                    win = gameBoard.getGameBoard().board.every((element) => ((element[i] === gameBoard.getGameBoard().board[0][i]) && (gameBoard.getGameBoard().board[0][i] == "X" || gameBoard.getGameBoard().board[0][i] == "O")));
                };
            };
        };
        if (!win) {win = gameBoard.getGameBoard().board.every((element) => (element[gameBoard.getGameBoard().board.indexOf(element)] === gameBoard.getGameBoard().board[1][1]) && (gameBoard.getGameBoard().board[1][1] == "X" || gameBoard.getGameBoard().board[1][1] == "O"));};
        if (!win) {win = gameBoard.getGameBoard().board.every((element) => (element[gameBoard.getGameBoard().rows - 1 - gameBoard.getGameBoard().board.indexOf(element)] === gameBoard.getGameBoard().board[1][1])  && (gameBoard.getGameBoard().board[1][1] == "X" || gameBoard.getGameBoard().board[1][1] == "O"));};
        return win;
    };

    const enablePlaceMarker = function() {
        document.body.addEventListener("click", placeMarker, false);
    };

    const enableSwitchPlayer = function() {
        document.body.addEventListener("click", switchPlayer, false);
    };

    const disablePlaceMarker = function() {
        document.body.removeEventListener("click", placeMarker, false);
    };

    const disableSwitchPlayer = function() {
        document.body.removeEventListener("click", switchPlayer, false);
    };

    const enableCheckWin = function() {
        document.body.addEventListener("click", checkWin, false)
    };

    initRound();
})();