from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Habit, HabitLog
from .services import StreakService


class StreakServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.today = date.today()

    def _create_habit(self, habit_type='standard'):
        return Habit.objects.create(
            user=self.user,
            name='Test Habit',
            color='#FF5733',
            target_goal=7,
            saver_goal=2,
            type=habit_type,
        )

    def _log(self, habit, days_ago, status):
        return HabitLog.objects.create(
            habit=habit,
            date=self.today - timedelta(days=days_ago),
            status=status,
        )

    def test_no_logs_returns_zero(self):
        habit = self._create_habit()
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_single_completed(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_single_saver_used(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.SAVER_USED)
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_single_failed(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.FAILED)
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_single_skipped(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.SKIPPED)
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_daily_streak_three_days(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        self._log(habit, 1, HabitLog.COMPLETED)   # yesterday
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago
        self.assertEqual(StreakService.compute_streak(habit), 3)

    def test_saver_maintains_but_does_not_increment(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)
        self._log(habit, 1, HabitLog.SAVER_USED)
        self._log(habit, 2, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 2)

    def test_saver_at_start_of_streak(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.SAVER_USED)
        self._log(habit, 1, HabitLog.COMPLETED)
        self._log(habit, 2, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 2)

    def test_failed_breaks_streak(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)
        self._log(habit, 1, HabitLog.FAILED)
        self._log(habit, 2, HabitLog.COMPLETED)
        self._log(habit, 3, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_skipped_breaks_streak(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)
        self._log(habit, 1, HabitLog.SKIPPED)
        self._log(habit, 2, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_failed_at_most_recent_returns_zero(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.FAILED)
        self._log(habit, 1, HabitLog.COMPLETED)
        self._log(habit, 2, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_standard_breaks_on_missing_day(self):
        habit = self._create_habit('standard')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        # day 1 ago: missing
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago
        self._log(habit, 3, HabitLog.COMPLETED)   # 3 days ago
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_standard_missing_day_in_middle_breaks(self):
        habit = self._create_habit('standard')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        self._log(habit, 1, HabitLog.COMPLETED)   # yesterday
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago
        # day 3 ago: missing
        self._log(habit, 4, HabitLog.COMPLETED)   # 4 days ago
        self._log(habit, 5, HabitLog.COMPLETED)   # 5 days ago
        self.assertEqual(StreakService.compute_streak(habit), 3)

    def test_stretched_allows_one_gap_day(self):
        habit = self._create_habit('stretched')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        # day 1 ago: missing (gap day)
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago
        self.assertEqual(StreakService.compute_streak(habit), 2)

    def test_stretched_two_gap_days_breaks(self):
        habit = self._create_habit('stretched')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        # day 1 ago: missing
        # day 2 ago: missing
        self._log(habit, 3, HabitLog.COMPLETED)   # 3 days ago
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_stretched_saver_with_gap(self):
        habit = self._create_habit('stretched')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        self._log(habit, 1, HabitLog.SAVER_USED)  # yesterday
        # day 2 ago: missing (gap)
        self._log(habit, 3, HabitLog.COMPLETED)   # 3 days ago
        self.assertEqual(StreakService.compute_streak(habit), 2)

    def test_stretched_multiple_one_day_gaps(self):
        habit = self._create_habit('stretched')
        self._log(habit, 0, HabitLog.COMPLETED)   # day 0
        # day 1: missing (gap)
        self._log(habit, 2, HabitLog.COMPLETED)   # day 2
        # day 3: missing (gap)
        self._log(habit, 4, HabitLog.COMPLETED)   # day 4
        self.assertEqual(StreakService.compute_streak(habit), 3)

    def test_stretched_failed_breaks_within_gap_window(self):
        habit = self._create_habit('stretched')
        self._log(habit, 0, HabitLog.COMPLETED)   # today
        self._log(habit, 1, HabitLog.FAILED)      # yesterday
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago
        self.assertEqual(StreakService.compute_streak(habit), 1)

    def test_mixed_streak_with_savers(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.COMPLETED)   # today: +1
        self._log(habit, 1, HabitLog.SAVER_USED)  # yesterday: maintain
        self._log(habit, 2, HabitLog.COMPLETED)   # 2 days ago: +1
        self._log(habit, 3, HabitLog.COMPLETED)   # 3 days ago: +1
        self.assertEqual(StreakService.compute_streak(habit), 3)

    def test_all_savers_no_completions(self):
        habit = self._create_habit()
        self._log(habit, 0, HabitLog.SAVER_USED)
        self._log(habit, 1, HabitLog.SAVER_USED)
        self._log(habit, 2, HabitLog.SAVER_USED)
        self.assertEqual(StreakService.compute_streak(habit), 0)

    def test_long_streak(self):
        habit = self._create_habit()
        for i in range(30):
            self._log(habit, i, HabitLog.COMPLETED)
        self.assertEqual(StreakService.compute_streak(habit), 30)