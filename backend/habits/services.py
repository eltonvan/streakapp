from datetime import date
from .models import Habit


class StreakService:
    @staticmethod
    def compute_streak(habit):
        logs = list(habit.logs.order_by('-date').values_list('date', 'status'))

        if not logs:
            return 0

        streak = 0
        prev_date = logs[0][0]

        if logs[0][1] in ('failed', 'skipped'):
            return 0
        if logs[0][1] == 'completed':
            streak = 1

        max_gap = 2 if habit.type == 'stretched' else 1

        for i in range(1, len(logs)):
            curr_date, status = logs[i]
            gap = (prev_date - curr_date).days

            if gap > max_gap:
                break

            if status in ('failed', 'skipped'):
                break

            if status == 'completed':
                streak += 1

            prev_date = curr_date

        return streak