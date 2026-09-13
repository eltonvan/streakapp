import {
  getUnsyncedHabits,
  getUnsyncedLogs,
  markHabitsSynced,
  markLogsSynced,
} from '../database/db';

const BASE_URL = 'http://192.168.1.X:8000/api';

export async function syncWithServer(): Promise<boolean> {
  try {
    const habits = await getUnsyncedHabits();
    const logs = await getUnsyncedLogs();

    if (habits.length === 0 && logs.length === 0) {
      return true;
    }

    const response = await fetch(`${BASE_URL}/bulk-sync/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habits: habits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          target_goal: h.target_goal,
          saver_goal: h.saver_goal,
          type: h.type,
        })),
        logs: logs.map((l) => ({
          id: l.id,
          habit_id: l.habit_id,
          date: l.date,
          status: l.status,
        })),
      }),
    });

    if (response.ok) {
      if (habits.length > 0) {
        await markHabitsSynced(habits.map((h) => h.id));
      }
      if (logs.length > 0) {
        await markLogsSynced(logs.map((l) => l.id));
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}