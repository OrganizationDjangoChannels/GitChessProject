let board = null
let game = new Chess();

const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'

let chessmove_audio = new Audio('/static/ChessChannelsApp/sounds/chessmove_sound.mp3');

function removeGreySquares() {
    $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
    let $square = $('#myBoard .square-' + square)

    let background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey
    }

    $square.css('background', background)
}

function onDragStart (source, piece) {
    // do not pick up pieces if the game is over
    if (game.game_over()){

        return false
        }

    // or if it's not that side's turn
    if ((game.turn === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }


}

function onDrop (source, target, piece) {
    removeGreySquares()

    // see if the move is legal



    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
    // console.log(`chessmoves_array = ${chessmoves_array}`);

    // illegal move
    if (move === null) return 'snapback'

    if (move.san === moves_array[move_index]){
        if (move_index < moves_array.length - 1){
            game.move(moves_array[move_index + 1])
        }

        move_index += 2;

    }
    else{
        game.undo();
        board.position(game.fen());
    }

    chessmove_audio.play();


}

function onMouseoverSquare (square, piece) {
    // get list of possible moves or this square
    let moves = game.moves({
        square: square,
        verbose: true
    });
    if (moves.length === 0){
        return;
    }

    greySquare(square)

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to)
    }

}


function onMouseoutSquare () {
    removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen());

}

let config = {
  draggable: true,
  position: fen,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
  orientation: board_orientation_loaded,
}

game.load(config.position);

board = Chessboard('myBoard', config);