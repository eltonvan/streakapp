from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    FREE = 'free'
    PRO_YEARLY = 'pro_yearly'
    PRO_LIFETIME = 'pro_lifetime'
    TIER_CHOICES = [
        (FREE, 'Free'),
        (PRO_YEARLY, 'Pro Yearly'),
        (PRO_LIFETIME, 'Pro Lifetime'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    subscription_tier = models.CharField(max_length=20, choices=TIER_CHOICES, default=FREE)

    def __str__(self):
        return f"{self.user.username} ({self.subscription_tier})"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class Habit(models.Model):
    STANDARD = 'standard'
    STRETCHED = 'stretched'
    TYPE_CHOICES = [
        (STANDARD, 'Standard'),
        (STRETCHED, 'Stretched'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    color = models.CharField(max_length=7, help_text='Hex color code (e.g. #FF5733)')
    target_goal = models.PositiveIntegerField()
    saver_goal = models.PositiveIntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=STANDARD)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class HabitLog(models.Model):
    COMPLETED = 'completed'
    SAVER_USED = 'saver_used'
    FAILED = 'failed'
    SKIPPED = 'skipped'
    STATUS_CHOICES = [
        (COMPLETED, 'Completed'),
        (SAVER_USED, 'Saver Used'),
        (FAILED, 'Failed'),
        (SKIPPED, 'Skipped'),
    ]

    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ['habit', 'date']

    def __str__(self):
        return f"{self.habit.name} - {self.date} ({self.status})"