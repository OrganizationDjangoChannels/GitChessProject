import json
from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from django.shortcuts import redirect
from secrets import token_urlsafe
from time import sleep
from datetime import datetime
from threading import Timer
from .models import *

players_searching_set = set()
players_searching_dict = {'5+3': set(), '3+2': set(), '1+1': set(), '3+0': set(), '5+0': set(), }
players_pairs = {}
play_connected_usernames_dict = dict()    # {token: set(), }



# game_object = Game.objects.get(pk=1)
# print(f'Database: {game_object.token} {game_object.white_pieces_player} {game_object.black_pieces_player}')

@database_sync_to_async
def get_game_by_token(token):
    game = Game.objects.get(token=token)
    return game


@database_sync_to_async
def get_chat_messages_by_token(token):
    queryset_chat_messages = ChatMessages.objects.filter(token=token).order_by('-id')
    arr_messages = []

    for queryset_chat_message in queryset_chat_messages:

        arr_messages.append({
                            'message': queryset_chat_message.message,
                            'username': queryset_chat_message.username,
                            'id': queryset_chat_message.id,
                            })

        # print(queryset_chat_message.message, queryset_chat_message.username, queryset_chat_message.id)
    return arr_messages


@database_sync_to_async
def get_white_pieces_player(token):
    game = Game.objects.get(token=token)
    white_pieces_player = game.white_pieces_player
    return white_pieces_player


@database_sync_to_async
def get_black_pieces_player(token):
    game = Game.objects.get(token=token)
    black_pieces_player = game.black_pieces_player
    return black_pieces_player


@database_sync_to_async
def write_into_chat_messages_by_token(token, username, message):
    chat_messages = ChatMessages()
    chat_messages.token = token
    chat_messages.username = username
    chat_messages.message = message
    chat_messages.save()



@database_sync_to_async
def write_object_into_database(database_object, update_fields=None):
    if update_fields is not None:
        database_object.save(update_fields=update_fields)
    else:
        database_object.save()


def check_matchmaking(server, username, channel_layer, room_group_name):
    next_launch = Timer(1.0, check_matchmaking, args=[server, username, channel_layer, room_group_name])
    next_launch.start()  # relaunches in 1 second

    for key in players_pairs.keys():
        usernames = players_pairs[key]
        if username in usernames:
            next_launch.cancel()
            print(f'username {username} is going to play...')
            try:
                throw_game_exception = Game.objects.get(token=key)

                usernames.remove(username)
                players_pairs[key] = usernames  # update

                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'matchmaking_message',
                        'username': username,
                        'room': key,
                    }
                )

            except Game.DoesNotExist:
                print('still waiting response from database')



        # print(key, players_pairs[key], username)


def simple_matchmaking(server):  # temporary
    for key in players_searching_dict.keys():
        time_control_players_set = players_searching_dict[key]
        if len(time_control_players_set) >= 2:
            white_pieces_player = time_control_players_set.pop()  # random choice
            black_pieces_player = time_control_players_set.pop()  # random choice

            game_token = token_urlsafe(16)  # url-token
            try:
                throw_game_exception = Game.objects.get(token=game_token)  # check if game_token already exists
                simple_matchmaking(server)  # if it does: try to do this function again
            except Game.DoesNotExist:  # This means the game_token is unique.

                temporary_set = set()
                temporary_set.add(white_pieces_player)
                temporary_set.add(black_pieces_player)

                players_pairs[game_token] = temporary_set

                print(f'matchmaking: white_pieces - {white_pieces_player}, black_pieces - {black_pieces_player}')
                print(players_pairs)



                # writing into the database
                game = Game(token=game_token,
                            white_pieces_player=white_pieces_player,
                            black_pieces_player=black_pieces_player,
                            )

                game.save()

        players_searching_dict[key] = time_control_players_set  # update

    print(players_searching_dict)


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        game_number = self.scope['url_route']['kwargs']['game_number']
        self.room_group_name = game_number

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )


        # get user
        self.user = self.scope["user"]

        if self.user.is_authenticated:

            print('accepted')
            await self.accept()

            white_pieces_player = await get_white_pieces_player(game_number)
            black_pieces_player = await get_black_pieces_player(game_number)
            white_pieces_player_connected = 0
            black_pieces_player_connected = 0

            check_existence_of_set = play_connected_usernames_dict.get(game_number)
            if check_existence_of_set is None:
                play_connected_usernames_dict[game_number] = set()

            if self.user.username not in play_connected_usernames_dict[game_number]:

                play_connected_usernames_dict[game_number].add(self.user.username)

            if white_pieces_player in play_connected_usernames_dict[game_number]:
                white_pieces_player_connected = 1

            if black_pieces_player in play_connected_usernames_dict[game_number]:
                black_pieces_player_connected = 1

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'connection_message',
                    'message': 1,
                    'username': self.user.username,
                    'number_of_viewers': len(play_connected_usernames_dict[game_number]),
                    'white_pieces_player_connected': white_pieces_player_connected,
                    'black_pieces_player_connected': black_pieces_player_connected,
                    'token': game_number,
                }
            )

            # print('play_connected_usernames_dict', play_connected_usernames_dict)

            self.all_chat_messages_array = await get_chat_messages_by_token(token=game_number)
            self.number_of_all_sent_messages = 0
            # print(self.all_chat_messages_array)
            self.number_of_dynamic_loading_messages = 5

            number_of_default_chat_messages = min(self.number_of_dynamic_loading_messages,
                                                  len(self.all_chat_messages_array))

            self.number_of_all_sent_messages = number_of_default_chat_messages

            for i in range(number_of_default_chat_messages):
                await self.send(text_data=json.dumps({
                    'type': 'loaded_chat_message',
                    'message': self.all_chat_messages_array[i]['message'],
                    'username': self.all_chat_messages_array[i]['username'],
                    'id': self.all_chat_messages_array[i]['id'],
                }))

            print(f'self.number_of_all_sent_messages {self.number_of_all_sent_messages}')

        else:
            print('denied')

    async def disconnect(self, close_code):
        # Leave room group
        game_number = self.scope['url_route']['kwargs']['game_number']
        self.room_group_name = game_number

        self.user = self.scope["user"]
        print(f'Username {self.user.username} has disconnected.')

        play_connected_usernames_dict[game_number].remove(self.user.username)

        white_pieces_player = await get_white_pieces_player(game_number)
        black_pieces_player = await get_black_pieces_player(game_number)
        white_pieces_player_connected = 0
        black_pieces_player_connected = 0

        if white_pieces_player in play_connected_usernames_dict[game_number]:
            white_pieces_player_connected = 1

        if black_pieces_player in play_connected_usernames_dict[game_number]:
            black_pieces_player_connected = 1

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'connection_message',
                'message': 0,
                'username': self.user.username,
                'number_of_viewers': len(play_connected_usernames_dict[game_number]),
                'white_pieces_player_connected': white_pieces_player_connected,
                'black_pieces_player_connected': black_pieces_player_connected,
                'token': game_number,
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        print('play_connected_usernames_dict', play_connected_usernames_dict)

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        # print(username, message, time, token)

        if type == 'dynamic_loading':

            number_of_loading_chat_messages = min(self.number_of_all_sent_messages + self.number_of_dynamic_loading_messages,
                                                  len(self.all_chat_messages_array))
            print(f'number_of_loading_chat_messages: {number_of_loading_chat_messages}')
            # Send message to WebSocket
            for i in range(self.number_of_all_sent_messages, number_of_loading_chat_messages):
                await self.send(text_data=json.dumps({
                    'type': 'loaded_chat_message',
                    'message': self.all_chat_messages_array[i]['message'],
                    'username': self.all_chat_messages_array[i]['username'],
                    'id': self.all_chat_messages_array[i]['id'],
                }))

            self.number_of_all_sent_messages = number_of_loading_chat_messages

            print(f'self.number_of_all_sent_messages: {self.number_of_all_sent_messages}')



        if type == 'chat':

            message = text_data_json['message']
            username = text_data_json['username']
            time = text_data_json['time']
            token = text_data_json['token']

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                    'time': time,
                    'token': token,
                }
            )
            await write_into_chat_messages_by_token(token=token, username=username, message=message)


            # game = await get_game_by_token(token=token)
            # chat_messages_update = game.chat_messages + f'{username}: "{message}";'
            # game.chat_messages = chat_messages_update
            # game.chat_messages = ""
            # await write_object_into_database(game, ['chat_messages'])

        if type == 'chess_move':

            message = text_data_json['message']
            username = text_data_json['username']
            time = text_data_json['time']
            token = text_data_json['token']

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chess_move_message',
                    'message': message,
                    'username': username,
                    'time': time,
                    'token': token,
                }
            )

    async def connection_message(self, event):
        message = event['message']
        username = event['username']
        token = event['token']
        number_of_viewers = event['number_of_viewers']
        white_pieces_player_connected = event['white_pieces_player_connected']
        black_pieces_player_connected = event['black_pieces_player_connected']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'message': message,
            'username': username,
            'number_of_viewers': number_of_viewers,
            'white_pieces_player_connected': white_pieces_player_connected,
            'black_pieces_player_connected': black_pieces_player_connected,
        }))


    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        time = event['time']
        token = event['token']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'username': username,
            'time': time,
        }))
        # game = await get_game_by_token(token=token)
        # print(game.chat_messages)

    async def chess_move_message(self, event):
        message = event['message']
        username = event['username']
        time = event['time']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chess_move',
            'message': message,
            'username': username,
            'time': time,
        }))


class MatchmakingConsumer(WebsocketConsumer):
    def connect(self):

        # get user
        self.user = self.scope["user"]
        self.room_group_name = 'common'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name,
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

        print(f'close_code {close_code}')

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json['username']
        searching = text_data_json['searching']

        print(message, username, searching)

        if searching:
            player_tuple = (message, username)
            players_searching_set.add(player_tuple)
            players_searching_dict[message].add(username)
            simple_matchmaking(self)
            check_matchmaking(self, self.user.username, self.channel_layer, self.room_group_name)
            print(f'players_pairs {players_pairs}')




        else:
            players_searching_set.discard((message, username))
            players_searching_dict[message].discard(username)

        print(players_searching_set)
        print(players_searching_dict)
        print(f'current user {self.user}')



    def matchmaking_message(self, event):
        username = event['username']
        room = event['room']
        print('matchmaking_message was called')
        self.send(text_data=json.dumps({
            'type': 'matchmaking',
            'username': username,
            'room': room,
        }))






