# Generated by Django 4.1.7 on 2023-04-27 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ChessChannelsApp', '0008_puzzle'),
    ]

    operations = [
        migrations.AddField(
            model_name='puzzle',
            name='board_orientation',
            field=models.CharField(default='white', max_length=30),
        ),
    ]