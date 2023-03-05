# Generated by Django 4.1.7 on 2023-02-25 10:08

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChatMessages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=255)),
                ('message', models.CharField(max_length=255)),
                ('username', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='ChessMoves',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=255)),
                ('move', models.CharField(max_length=255)),
                ('username', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=255)),
                ('white_pieces_player', models.CharField(max_length=30)),
                ('white_pieces_player_rating', models.IntegerField(default=1000)),
                ('black_pieces_player', models.CharField(max_length=30)),
                ('black_pieces_player_rating', models.IntegerField(default=1000)),
                ('time_create', models.DateTimeField(auto_now_add=True)),
                ('isActive', models.BooleanField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=30)),
                ('friends', models.TextField(blank=True)),
                ('bullet_rating', models.FloatField(default=1000.0)),
                ('blitz_rating', models.FloatField(default=1000.0)),
                ('rapid_rating', models.FloatField(default=1000.0)),
                ('classical_rating', models.FloatField(default=1000.0)),
            ],
        ),
    ]
