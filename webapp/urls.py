from django.urls import path

from . import views

app_name = 'webapp'

urlpatterns = [
    path('', views.index, name='index'),
    path('images', views.handleImageUploader, name='imageUploader'), 
]
