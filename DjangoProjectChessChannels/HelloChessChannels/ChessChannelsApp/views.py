from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import Http404
from django.core import serializers
from secrets import token_urlsafe

from .forms import *
from .models import *
from django.contrib.auth import authenticate, login, logout
import re


# Create your views here.
username_pattern = re.compile(r'^[A-Za-z0-9_-]{6,20}$')
# password_pattern = re.compile(r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
email_pattern = re.compile("^[a-zA-z0-9\.\-_]+@{1}[a-zA-Z0-9]+\.{1}[a-zA-Z]{2,3}$")



def show_puzzle(request, puzzle_number=1):
    data = {'title': 'show_puzzle'}

    try:
        puzzle = Puzzle.objects.get(token=puzzle_number)
        data['puzzle'] = puzzle
        print(f'puzzle {puzzle.token}')

    except Puzzle.DoesNotExist:
        raise Http404

    return render(request, 'ChessChannelsApp/puzzle.html', context=data)


def localgame(request):
    data = {'title': 'localplay'}
    return render(request, 'ChessChannelsApp/localgame.html', context=data)


def play(request, game_number=1):
    data = {'title': 'game'}
    try:
        game = Game.objects.get(token=game_number)
        data['game'] = game
        print(f'game {game.token}')
        chat_messages = ChatMessages.objects.filter(token=game_number).order_by('-id')
        print(chat_messages.query)
        # for chat_message in chat_messages:
        #     print(f'{chat_message.id} {chat_message.username}: {chat_message.message}')

        chat_messages_json = serializers.serialize("json", chat_messages)
    except Game.DoesNotExist:
        raise Http404

    return render(request, 'ChessChannelsApp/play.html', context=data)


def base(request):
    data = {'title': 'base'}
    return render(request, 'ChessChannelsApp/base.html', context=data)


def index(request):

    if request.method == 'POST':
        print(request.POST)

    data = {'title': 'main'}

    return render(request, 'ChessChannelsApp/main.html', context=data)


def ratings(request):
    data = {'title': 'ratings'}
    return render(request, 'ChessChannelsApp/ratings.html', context=data)


def puzzles(request):
    data = {'title': 'puzzles'}
    puzzles_dict = dict()

    try:
        puzzles = Puzzle.objects.all()
        for puzzle in puzzles:

            puzzles_dict[str(puzzle.id)] = puzzle
            # print(puzzle.token)
    except Puzzle.DoesNotExist:
        raise Http404


    data['puzzles'] = puzzles_dict
    return render(request, 'ChessChannelsApp/ratings.html', context=data)


def profile(request, username='undefined'):
    data = {'title': 'profile'}
    profile_username = username

    data['profile_username'] = profile_username
    return render(request, 'ChessChannelsApp/profile.html', context=data)


def login_page(request):
    data = {'title': 'login'}

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is None:
            messages.error(request, 'Username or Password is incorrect.')

        else:
            login(request, user)
            return redirect('home')

    return render(request, 'ChessChannelsApp/login.html', context=data)


def logout_user(request):
    logout(request)
    return redirect('home')


def register_page(request):
    form = CreateUserForm()

    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():

            if re.match(username_pattern, form.cleaned_data.get('username')) is None:
                messages.error(request, 'Username example: TEST_username_2023.  '
                                        ' Username length must be between 6 and 20 characters \n'
                                        'and there are some characters allowed: english upper and lower cases, digits, '
                                        'dash and underscore.')
                # messages.error(request, 'and username must not have a length equal to 2 of special symbols in a row.')
            elif re.match(email_pattern, form.cleaned_data.get('email')) is None:
                messages.error(request, 'Email example: test_email@gmail.com  '
                                        ' Email does not match the pattern of common emails.')

            # elif re.match(password_pattern, form.cleaned_data.get('password1')) is None:
            #     messages.error(request, 'Password example: test_Password_2023*  '
            #                             ' Password must have minimum 8 characters in length, \n'
            #                             'at least one uppercase and one lowercase English letter,'
            #                             'at least one digit and at least one special character of ?=.*?[#?!@$%^&*-]'
            #                    )

            else:
                user = form.save()
                name = form.cleaned_data.get('username')

                # messages.success(request, f'Username {name} was successfully created')
                login(request, user)
                return redirect('home')

        else:
            message_errors_limit = 1
            message_errors_counter = 0
            form_validation_errors = form.errors.as_data()
            for form_validation_errors_list in form_validation_errors.values():
                for form_error in form_validation_errors_list:
                    if message_errors_counter < message_errors_limit:
                        message_errors_counter += 1
                        form_error_message = form_error.message
                        if form_error_message == "This password is too short. It must contain at least %(min_length)d characters.":
                            form_error_message = "This password is too short. It must contain at least 8 characters."

                        if form_error_message == "The password is too similar to the %(verbose_name)s.":
                            form_error_message = "The password is too similar to the username."
                        messages.error(request, form_error_message)

                        print(form_error_message)

        # name = form.cleaned_data.get('username')
        # secret_password = form.cleaned_data.get('password1')
        # print(name, secret_password)

    data = {'title': 'register', 'form': form}

    return render(request, 'ChessChannelsApp/register.html', context=data)
