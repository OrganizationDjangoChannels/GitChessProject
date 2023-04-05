// useless comment
let board = null
let game = new Chess()
let stack = []
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'chessmove'){
        console.log(`received ${data.message} from ${data.username} at ${data.time}`);
        let current_time = new Date();
        let server_received_time = Date.parse(data.time);
        console.log(`time diff: ${current_time - server_received_time}ms.`);
        let move = game.move({
            from: data.move_from,
            to: data.move_to,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })

        board.position(game.fen())
    }

    if (data.type === 'chat'){
        let messages = document.getElementById('chat_messages');

        let div_tag = document.createElement("div");

        let p_tag = document.createElement("p");
        p_tag.innerHTML = `${data.username}: ${data.message}`;
        p_tag.style.color = 'white';
        // let p_tag_time = document.createElement("p");
        // p_tag_time.innerHTML = `now: ${data.time}  received back: ${new Date().toLocaleTimeString()}`;
        // p_tag_time.style.color = 'white';

        div_tag.append(p_tag);
        // div_tag.append(p_tag_time);
        messages.append(div_tag);

        messages.scrollTo(0, messages.scrollHeight);
    }



    if (data.type === 'connection'){
        let username = data.username;
        white_pieces_player_connected = data.white_pieces_player_connected;
        black_pieces_player_connected = data.black_pieces_player_connected;


        console.log(data);

        if (username === current_username){
            current_user_connected = true;
        }


        white_span_connection_status = document.getElementById('white_pieces_player_connection_status');
        black_span_connection_status = document.getElementById('black_pieces_player_connection_status');

        if (white_pieces_player_connected === 1){
            white_span_connection_status.innerText = 'online';
        }else{
            white_span_connection_status.innerText = 'offline';
        }

        if (black_pieces_player_connected === 1){
            black_span_connection_status.innerText = 'online';
        }else{
            black_span_connection_status.innerText = 'offline';
        }


        number_of_viewers = data.number_of_viewers;



    }

    if (data.type === 'loaded_chat_message'){
        let username = data.username;
        let message = data.message;
        console.log(`${username}: ${message}`);
        // data.id printing is temporary
        // let height = write_chat_message_into_tag(`${data.id} ${username}: ${message}`, chat_messages_div);
        let height = write_chat_message_into_tag(`${username}: ${message}`, chat_messages_div);
        chat_messages_div.scrollTo(0, height);
    }

}

function removeGreySquares () {
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



function onDrop (source, target, oldPos, newPos) {
    removeGreySquares()

    // see if the move is legal
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'
    stack = game.history()
    if(game.game_over()){
        const h = document.getElementById("myButton")
        h.disabled = false
        const h1 = document.getElementById("myButton1")
        h1.disabled = false

        alert(`${game.turn() === 'w'? "Black":"White"} is winner.`)
    }

    // try to connect to server
    let current_time_hms = new Date().toISOString();
    console.log(current_time_hms);
    chatSocket.send(JSON.stringify({
                        'type': 'chessmove',
                        'message': move.san,
                        'move_from': move.from,
                        'move_to': move.to,
                        'username': current_username,
                        'time': current_time_hms,
                        'token': game_token,
                    }));
    console.log(move.san); // print chessmove into the console
    console.log(move.to);
    console.log("bred");


}

function onMouseoverSquare (square) {
    // get list of possible moves or this square
    let moves = game.moves({
        square: square,
        verbose: true
    })

    // exit if there are no moves available for this square
    if (moves.length === 0) return

    // highlight the square they moused over
    greySquare(square)

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to)
    }
}
let y = []
function returnMove(){
    y = game.history()
    game.reset()
    board.start(false)
    for(let i=0; i < (y.length)-1; i++){
        game.move(y[i])

    }
    board.position(game.fen(), false)

}
function nextMove(){
    y = game.history()
    if(y.length < stack.length){
        for(let c = y.length; c < y.length + 1; ++c){
            game.move(stack[c])
        }
        board.position(game.fen(), false)
    }

}
function onMouseoutSquare () {
    removeGreySquares()
}

function onSnapEnd () {
  board.position(game.fen());

}
let board_orientation = 'white';
let board_draggable = true;

if (current_username === black_pieces_player){
    board_orientation = 'black';
}
else if (current_username === white_pieces_player){
    board_orientation = 'white';
}
else{
    board_draggable = false;
}

let config = {
  draggable: board_draggable,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
  orientation: board_orientation,
}


board = Chessboard('myBoard', config);

