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

    const editGameBoard = function(activePlayer) {
        let valid = false;
        while (!valid) {
            let [row, column] = prompt(`${activePlayer.name}: Where to place?`).split(",");
            if (gameBoard.board[row][column] == "") {
                gameBoard.board[row][column] = activePlayer.marker;
                valid = true;
            } else {alert("This spot is taken!")}
        };
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
    let win = false;

    pubsub.emit("createGameBoard", 3, 3);

    const initRound = function() {
        pubsub.emit("editGameBoard", activePlayer);
        switchPlayer();
    }

    const switchPlayer = function() {
        (activePlayer == players[0]) ? activePlayer = players[1] : activePlayer = players[0];
    }

    const checkWin = function(gameBoard) {
        for (let i=0; i<gameBoard.rows-1; i++) {
            if (!win) {
                win = gameBoard.board[i].every((element) => ((element === gameBoard.board[i][0]) && (gameBoard.board[i][0] == "X" || gameBoard.board[i][0] == "O")));
            };
        };
        if (!win) {
            for (let i=0; i<gameBoard.columns-1; i++) {
                if (!win) {
                    win = gameBoard.board.every((element) => ((element[i] === gameBoard.board[0][i]) && (gameBoard.board[0][i] == "X" || gameBoard.board[0][i] == "O")));
                };
            };
        };
        if (!win) {win = gameBoard.board.every((element) => (element[gameBoard.board.indexOf(element)] === gameBoard.board[1][1]) && (gameBoard.board[1][1] == "X" || gameBoard.board[1][1] == "O"));};
        if (!win) {win = gameBoard.board.every((element) => (element[gameBoard.rows - 1 - gameBoard.board.indexOf(element)] === gameBoard.board[1][1])  && (gameBoard.board[1][1] == "X" || gameBoard.board[1][1] == "O"));};
    };

    while (!win) {
        initRound();
        checkWin(gameBoard.getGameBoard());
    }
})();