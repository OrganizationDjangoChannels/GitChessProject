from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='home'),
    path('base/', views.base, name='base'),
    path('ratings/', views.ratings, name='ratings'),
    path('puzzles/', views.puzzles, name='puzzles'),
    path('login/', views.login_page, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('register/', views.register_page, name='register'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('play/<str:game_number>', views.play, name='play'),
    path('play/', views.play, name='play'),
    path('localgame/', views.localgame, name='localgame'),


]
