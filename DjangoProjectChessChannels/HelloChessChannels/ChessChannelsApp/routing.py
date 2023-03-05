from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    # re_path(r'ws/socket-server/(?P<game_number>\w+)/$', consumers.ChatConsumer.as_asgi()),
    path('ws/socket-server/play/<str:game_number>/', consumers.ChatConsumer.as_asgi()),
    path('ws/socket-server/main/', consumers.MatchmakingConsumer.as_asgi()),
]