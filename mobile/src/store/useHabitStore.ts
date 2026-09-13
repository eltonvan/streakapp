import { create } from 'zustand';
import {
  initDatabase,
  insertHabit,
  logDailyStatus,
  getAllHabits,
  getAllLogs,
  type LocalHabitRow,
  type LocalHabitLogRow,
} from '../database/db';

interface HabitStore {
  habits: LocalHabitRow[];
  logs: LocalHabitLogRow[];
  loadData: () => Promise<void>;
  addHabit: (params: {
    name: string;
    color: string;
    targetGoal: number;
    saverGoal: number;
    type: string;
  }) => Promise<string>;
  logHabitStatus: (params: {
    habitId: string;
    date: string;
    status: string;
  }) => Promise<string>;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  logs: [],

  loadData: async () => {
    await initDatabase();
    const [habits, logs] = await Promise.all([getAllHabits(), getAllLogs()]);
    set({ habits, logs });
  },

  addHabit: async (params) => {
    const id = await insertHabit(params);
    set((state) => ({
      habits: [
        {
          id,
          name: params.name,
          color: params.color,
          target_goal: String(params.targetGoal),
          saver_goal: String(params.saverGoal),
          type: params.type,
          is_synced: 0,
        },
        ...state.habits,
      ],
    }));
    return id;
  },

  logHabitStatus: async (params) => {
    const id = await logDailyStatus(params);
    set((state) => ({
      logs: [
        {
          id,
          habit_id: params.habitId,
          date: params.date,
          status: params.status,
          is_synced: 0,
        },
        ...state.logs,
      ],
    }));
    return id;
  },
}));