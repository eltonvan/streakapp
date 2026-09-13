from rest_framework import serializers
from .models import Habit, HabitLog, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['subscription_tier']


class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['id', 'name', 'color', 'target_goal', 'saver_goal', 'type', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'status']