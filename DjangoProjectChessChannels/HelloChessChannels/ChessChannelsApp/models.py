from django.db import models

# Create your models here.


class Game(models.Model):
    token = models.CharField(max_length=255)
    white_pieces_player = models.CharField(max_length=30)
    white_pieces_player_rating = models.IntegerField(default=1000)
    black_pieces_player = models.CharField(max_length=30)
    black_pieces_player_rating = models.IntegerField(default=1000)
    white_full_time = models.IntegerField(default=100000, blank=True)
    black_full_time = models.IntegerField(default=100000, blank=True)
    game_mode = models.CharField(max_length=30, blank=True)
    increment = models.IntegerField(default=0)
    moves = models.TextField(blank=True)
    fens = models.TextField(blank=True)
    time_create = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)
    result = models.CharField(default="not_finished", max_length=30)


class Player(models.Model):
    username = models.CharField(max_length=30)
    friends = models.TextField(blank=True)
    bullet_rating = models.FloatField(default=1000.0)
    blitz_rating = models.FloatField(default=1000.0)
    rapid_rating = models.FloatField(default=1000.0)
    classical_rating = models.FloatField(default=1000.0)


class ChatMessages(models.Model):
    token = models.CharField(max_length=255)
    message = models.CharField(max_length=255)
    username = models.CharField(max_length=255)


class ChessMoves(models.Model):
    token = models.CharField(max_length=255)
    move = models.CharField(max_length=255)
    username = models.CharField(max_length=255)

