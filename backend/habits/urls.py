from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HabitViewSet, HabitLogViewSet, BulkSyncView, RegisterView

router = DefaultRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'habit-logs', HabitLogViewSet, basename='habitlog')

urlpatterns = [
    path('', include(router.urls)),
    path('bulk-sync/', BulkSyncView.as_view(), name='bulk-sync'),
    path('register/', RegisterView.as_view(), name='api-register'),
]