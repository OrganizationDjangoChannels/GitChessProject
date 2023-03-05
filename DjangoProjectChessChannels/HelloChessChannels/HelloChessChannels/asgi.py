"""
ASGI config for HelloChessChannels project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import ChessChannelsApp.routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HelloChessChannels.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            ChessChannelsApp.routing.websocket_urlpatterns
        )
    )
})
