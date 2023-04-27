# Generated by Django 4.1.7 on 2023-04-27 13:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ChessChannelsApp', '0007_game_result_alter_game_isactive'),
    ]

    operations = [
        migrations.CreateModel(
            name='Puzzle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=255)),
                ('fens', models.CharField(max_length=255)),
                ('moves', models.CharField(max_length=255)),
                ('puzzle_rating', models.FloatField(default=1000.0)),
            ],
        ),
    ]