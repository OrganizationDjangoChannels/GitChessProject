// useless comment
let board = null
let game = new Chess()
let stack = []
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'
let fens_array_dynamic = null;

if (fens_array.length === 1){
    fens_array_dynamic = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
}
else{
    fens_array_dynamic = fens_array.slice();
}

let fens_array_dynamic_index = null;
let fens_array_index = fens_array.length - 1;

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'chessmove'){
        console.log(`received ${data.message} from ${data.username} at ${data.time}`);
        let current_time = new Date();
        let server_received_time = Date.parse(data.time);
        console.log(`time diff: ${current_time - server_received_time}ms.`);
        let move = game.move(data.message);

        fens_array_dynamic.push(data.fen);
        console.log(`fens_array_dynamic = ${fens_array_dynamic}`);
        if (fens_array_dynamic.length > fens_array.length){
            fens_array_index = fens_array_dynamic.length - 1;  // update
        }
        console.log(fens_array_dynamic);
        fens_array_dynamic_index = fens_array_dynamic.length - 1;

        board.position(game.fen());


        if (game.game_over()){
            const h = document.getElementById("myButton")
            h.disabled = false
            const h1 = document.getElementById("myButton1")
            h1.disabled = false

            console.log(`${game.turn() === 'w'? "Black":"White"} is winner.`);
        }
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



function onDrop (source, target, piece) {
    removeGreySquares()

    // see if the move is legal
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
    console.log(move)

    // illegal move
    if (move === null) return 'snapback'

    if((current_username === white_pieces_player && move.color !== 'w') || (current_username === black_pieces_player && move.color !== 'b') ) {
        game.undo();
        return 'snapback';}

    stack = game.history()
    // if(game.game_over()){
    //     const h = document.getElementById("myButton")
    //     h.disabled = false
    //     const h1 = document.getElementById("myButton1")
    //     h1.disabled = false
    //
    //     alert(`${game.turn() === 'w'? "Black":"White"} is winner.`)
    //     console.log(`${game.turn() === 'w'? "Black":"White"} is winner.`);
    // }

    // try to connect to server
    let current_time_hms = new Date().toISOString();
    console.log(current_time_hms);
    chatSocket.send(JSON.stringify({
                        'type': 'chessmove',
                        'message': move.san,
                        'fen': game.fen(),
                        'move_from': move.from,
                        'move_to': move.to,
                        'username': current_username,
                        'time': current_time_hms,
                        'token': game_token,
                    }));
    console.log(move.san); // print chessmove into the console
    console.log(move.to);


}

function onMouseoverSquare (square, piece) {
    // get list of possible moves or this square
    let moves = game.moves({
        square: square,
        verbose: true
    })

    // exit if there are no moves available for this square
    if ((moves.length === 0) || (current_username !== white_pieces_player && current_username !== black_pieces_player) || (current_username === white_pieces_player && piece.search(/^b/) !== -1) || (current_username === black_pieces_player && piece.search(/^w/) !== -1))
    {
        return;
    }

    // highlight the square they moused over
    greySquare(square)

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to)
    }
}
let y = []


function returnMove(){
    if (fens_array_dynamic.length > fens_array.length){
        y = fens_array_dynamic;  // update
    }else{
        y = fens_array;
    }

    if (fens_array_index > 0){
        fens_array_index -= 1;
        board.position(y[fens_array_index], false)
        console.log(`game_history = ${y} ; index = ${fens_array_index}`);
    }

}
function nextMove(){
    if (fens_array_dynamic.length > fens_array.length){
        y = fens_array_dynamic;  // update
    }else{
        y = fens_array;
    }
    if (fens_array_index < y.length - 1){
        fens_array_index += 1;
        board.position(y[fens_array_index], false)
        console.log(`game_history = ${y}`);
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

for (let i = 0; i < chessmoves_array.length; i++){
    let move = game.move(chessmoves_array[i]);
}

board.position(game.fen(), false);

if (game.game_over()){


    console.log(`${game.turn() === 'w'? "Black":"White"} is winner.`);
}