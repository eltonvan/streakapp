import * as SQLite from 'expo-sqlite';

export interface LocalHabitRow {
  id: string;
  name: string;
  color: string;
  target_goal: string;
  saver_goal: string;
  type: string;
  is_synced: number;
}

export interface LocalHabitLogRow {
  id: string;
  habit_id: string;
  date: string;
  status: string;
  is_synced: number;
}

let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('habits.db');
  }
  return db;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export async function initDatabase(): Promise<void> {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS LocalHabit (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      target_goal TEXT NOT NULL,
      saver_goal TEXT NOT NULL,
      type TEXT NOT NULL,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS LocalHabitLog (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      is_synced INTEGER NOT NULL DEFAULT 0
    );
  `);
}

export async function insertHabit(params: {
  name: string;
  color: string;
  targetGoal: number;
  saverGoal: number;
  type: string;
}): Promise<string> {
  const database = await getDB();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO LocalHabit (id, name, color, target_goal, saver_goal, type, is_synced)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [id, params.name, params.color, String(params.targetGoal), String(params.saverGoal), params.type],
  );

  return id;
}

export async function logDailyStatus(params: {
  habitId: string;
  date: string;
  status: string;
}): Promise<string> {
  const database = await getDB();
  const id = generateId();

  await database.runAsync(
    `INSERT INTO LocalHabitLog (id, habit_id, date, status, is_synced)
     VALUES (?, ?, ?, ?, 0)`,
    [id, params.habitId, params.date, params.status],
  );

  return id;
}

export async function getAllHabits(): Promise<LocalHabitRow[]> {
  const database = await getDB();
  return database.getAllAsync<LocalHabitRow>('SELECT * FROM LocalHabit ORDER BY rowid DESC');
}

export async function getAllLogs(): Promise<LocalHabitLogRow[]> {
  const database = await getDB();
  return database.getAllAsync<LocalHabitLogRow>('SELECT * FROM LocalHabitLog ORDER BY date DESC');
}