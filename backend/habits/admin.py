from django.contrib import admin
from .models import UserProfile, Habit, HabitLog


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'subscription_tier']
    list_filter = ['subscription_tier']


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'type', 'target_goal', 'saver_goal', 'is_active', 'created_at']
    list_filter = ['type', 'is_active']


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ['habit', 'date', 'status']
    list_filter = ['status', 'date']