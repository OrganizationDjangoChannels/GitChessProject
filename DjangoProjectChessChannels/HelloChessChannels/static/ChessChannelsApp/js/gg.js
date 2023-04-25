// useless comment
let board = null
let game = new Chess()
let stack = []
const whiteSquareGrey = '#a9a9a9'
const blackSquareGrey = '#696969'
let fens_array_dynamic = null;

let chessmove_audio = new Audio('/static/ChessChannelsApp/sounds/chessmove_sound.mp3');

if (fens_array.length === 1){
    fens_array_dynamic = ['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'];
}
else{
    fens_array_dynamic = fens_array.slice();
}

let fens_array_dynamic_index = null;
let fens_array_index = fens_array.length - 1;

let div_myBoard = document.getElementById("div_myBoard");

let white_timer_div = document.createElement("div");
white_timer_div.className = "timer";
white_timer_div.id = "white_timer_div";

let black_timer_div = document.createElement("div");
black_timer_div.className = "timer";
black_timer_div.id = "black_timer_div";

if (current_username === white_pieces_player){
    div_myBoard.prepend(black_timer_div);
    div_myBoard.append(white_timer_div);
}

else if (current_username === black_pieces_player){
    div_myBoard.prepend(white_timer_div);
    div_myBoard.append(black_timer_div);
}
else{
    div_myBoard.prepend(black_timer_div);
    div_myBoard.append(white_timer_div);
}



class Timer{

    constructor(time_ms, increment = 0) {
        // this.minutes = Math.floor(time_ms / (60 * 1000))
        // this.seconds = Math.floor((time_ms - this.minutes * 60 * 1000) / 1000);
        // this.milliseconds = time_ms - this.minutes * 60 * 1000 - this.seconds * 1000;
        // this.full_time = time_ms;
        this.full_time = time_ms;
        this.increment = increment;
        this.timer_id = null;
        this.print_id = null;
        this.show_id = null;
        this.disabled = false;

    }

    print_time(){
        this.print_id = setInterval(() => {
            let minutes = ~~(this.full_time / (60 * 1000));
            let seconds = ~~(this.full_time / (1000)) - minutes * 60;
            let milliseconds = this.full_time - minutes * (60 * 1000) - seconds * 1000;
            if (minutes > 0){
                console.log(`${~~(minutes / 10)}${minutes % 10}:${~~(seconds / 10)}${seconds % 10}`);

            }
            else{
                console.log(`00:${~~(seconds / 10)}${seconds % 10}:${~~(milliseconds / 10)}${milliseconds % 10}`);
            }

        }, 1000);

    }

    show(element_id){
        this.show_id = setInterval(() => {
            let minutes = ~~(this.full_time / (60 * 1000));
            let seconds = ~~(this.full_time / (1000)) - minutes * 60;
            let milliseconds = this.full_time - minutes * (60 * 1000) - seconds * 1000;
            if (minutes > 0){
                // console.log(`${~~(minutes / 10)}${minutes % 10}:${~~(seconds / 10)}${seconds % 10}`);
                element_id.innerText = `${~~(minutes / 10)}${minutes % 10}:${~~(seconds / 10)}${seconds % 10}`;

            }
            else{
                // console.log(`00:${~~(seconds / 10)}${seconds % 10}:${~~(milliseconds / 10)}${milliseconds % 10}`);
                element_id.innerText = `${~~(minutes / 10)}${minutes % 10}:${~~(seconds / 10)}${seconds % 10}`;
            }

        }, 1000);
    }

    start(){
        if (!(this.disabled)){
            this.print_time();
            this.timer_id = setInterval(() => {

                this.full_time -= 100;
                // console.log(this.full_time);

                if (this.full_time <= 0){
                    this.full_time = 0;

                    if (white_pieces_timer.full_time <= 0){
                        chatSocket.send(JSON.stringify({
                            'type': 'game_result',
                            'token': game_token,
                            'result': 'black won by timeout.'
                        }));
                    }

                    if (black_pieces_timer.full_time <= 0){
                        chatSocket.send(JSON.stringify({
                            'type': 'game_result',
                            'token': game_token,
                            'result': 'white won by timeout.'
                        }));
                    }

                    this.stop();
                }
            }, 100);
        }

    }

    stop(){
        clearInterval(this.timer_id);
        clearInterval(this.print_id);
        // clearInterval(this.show_id);
    }

    launch_another_timer(another_timer){
        this.full_time += this.increment;
        this.stop();
        another_timer.start();
    }
}


let white_pieces_timer = new Timer(white_pieces_timer_loaded, increment_loaded);
let black_pieces_timer = new Timer(black_pieces_timer_loaded, increment_loaded);
white_pieces_timer.show(white_timer_div);
black_pieces_timer.show(black_timer_div);
// setTimeout(function(){timer1.start()}, 1000);
//
// setTimeout(function(){timer1.launch_another_timer(timer2)}, 5000);
//
// setTimeout(function(){timer2.launch_another_timer(timer1)}, 10000);
//
// setTimeout(function(){timer1.stop()}, 15000);

// white_timer_div = document.getElementById('white_timer_div');
// black_timer_div = document.getElementById('black_timer_div');
white_timer_div.innerText = String(white_pieces_timer_loaded);
black_timer_div.innerText = String(black_pieces_timer_loaded);

let send_time_to_the_server = setInterval( () => {
    setTimeout( () => {chatSocket.send(JSON.stringify({
        'type': 'send_time_to_the_server',
        'token': game_token,
        'white_full_time': white_pieces_timer.full_time,
        'black_full_time': black_pieces_timer.full_time,
    }));}, 500);

    console.log('time has been sent to the server');
}, 500);







if (fens_array_dynamic.length > 1){
    if (fens_array_dynamic.length % 2 === 0){
        black_pieces_timer.start();
    }
    else{
        white_pieces_timer.start();
    }
}

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'chessmove'){
        console.log(`received ${data.message} from ${data.username} at ${data.time}`);
        let current_time = new Date();
        let server_received_time = Date.parse(data.time);
        console.log(`time diff: ${current_time - server_received_time}ms.`);
        let move = game.move(data.message);
        chessmoves_array.push(data.message);

        fens_array_dynamic.push(data.fen);
        console.log(`fens_array_dynamic = ${fens_array_dynamic}`);
        if (fens_array_dynamic.length > fens_array.length){
            fens_array_index = fens_array_dynamic.length - 1;  // update
        }
        console.log(fens_array_dynamic);
        fens_array_dynamic_index = fens_array_dynamic.length - 1;

        board.position(game.fen());

        console.log(`chessmoves_array = ${chessmoves_array}`);
        console.log(`white_full_time : ${data.white_full_time}`);
        console.log(`black_full_time : ${data.black_full_time}`);

        if (chessmoves_array.length === 1){
            white_pieces_timer.launch_another_timer(black_pieces_timer);
            // black_pieces_timer.show(black_timer_div);
        }

        else if (chessmoves_array.length % 2 === 0 && chessmoves_array.length > 1){  // move is up to white
            black_pieces_timer.launch_another_timer(white_pieces_timer);
            // white_pieces_timer.show(white_timer_div);
        }

        else if (chessmoves_array.length > 1){
            white_pieces_timer.launch_another_timer(black_pieces_timer);
            black_pieces_timer.show(black_timer_div);
        }


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
    // console.log(`chessmoves_array = ${chessmoves_array}`);

    // illegal move
    if (move === null) return 'snapback'

    if((current_username === white_pieces_player && move.color !== 'w') || (current_username === black_pieces_player && move.color !== 'b') ) {
        game.undo();
        return 'snapback';}

    stack = game.history()


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
                        'white_full_time': white_pieces_timer.full_time,
                        'black_full_time': black_pieces_timer.full_time,
                    }));
    console.log(move.san); // print chessmove into the console
    console.log(move.to);
    chessmove_audio.play();


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

    white_pieces_timer.stop();
    black_pieces_timer.stop();
    white_pieces_timer.disabled = true;
    black_pieces_timer.disabled = true;


    console.log(`${game.turn() === 'w'? "Black":"White"} is winner.`);

    if (game.turn() === 'w' && game.in_checkmate()){
        chatSocket.send(JSON.stringify({
            'type': 'game_result',
            'token': game_token,
            'result': 'black won by checkmate.'
        }));
    }

    if (game.turn() === 'b' && game.in_checkmate()){
        chatSocket.send(JSON.stringify({
            'type': 'game_result',
            'token': game_token,
            'result': 'white won by checkmate.'
        }));
    }

    if (game.in_draw()){
        chatSocket.send(JSON.stringify({
            'type': 'game_result',
            'token': game_token,
            'result': 'draw'
        }));
    }

}