from rest_framework import viewsets, permissions, status, generics, serializers, throttling
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        profile = user.profile

        if profile.subscription_tier == 'free':
            active_count = Habit.objects.filter(user=user, is_active=True).count()
            if active_count >= 3:
                return Response(
                    {'detail': 'Free tier users are limited to 3 active habits.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return super().create(request, *args, **kwargs)


class HabitLogViewSet(viewsets.ModelViewSet):
    serializer_class = HabitLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HabitLog.objects.filter(habit__user=self.request.user)


class BulkSyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        habits_data = request.data.get('habits', [])
        logs_data = request.data.get('logs', [])

        habit_map = {}
        for item in habits_data:
            local_id = item.get('id')
            habit, _ = Habit.objects.update_or_create(
                local_id=local_id,
                user=user,
                defaults={
                    'user': user,
                    'name': item.get('name', ''),
                    'color': item.get('color', '#000000'),
                    'target_goal': int(item.get('target_goal', 0)),
                    'saver_goal': int(item.get('saver_goal', 0)),
                    'type': item.get('type', 'standard'),
                },
            )
            habit_map[local_id] = habit

        for item in logs_data:
            local_id = item.get('id')
            habit_local_id = item.get('habit_id')
            habit = habit_map.get(habit_local_id)

            if habit is None:
                continue

            HabitLog.objects.update_or_create(
                local_id=local_id,
                defaults={
                    'habit': habit,
                    'date': item.get('date'),
                    'status': item.get('status', 'completed'),
                },
            )

        return Response({'message': 'Sync completed successfully.'}, status=status.HTTP_200_OK)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )
        Token.objects.create(user=user)
        return user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = Token.objects.get(user=user)
        return Response(
            {'token': token.key, 'username': user.username},
            status=status.HTTP_201_CREATED,
        )