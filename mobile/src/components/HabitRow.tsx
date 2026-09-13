import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { palette, spacing, radius } from '../theme/theme';
import { useHabitStore } from '../store/useHabitStore';
import { calculateCurrentStreak } from '../utils/streakEngine';
import type { LocalHabitRow, LocalHabitLogRow } from '../database/db';

interface HabitRowProps {
  habit: LocalHabitRow;
  weekLogs: LocalHabitLogRow[];
}

const CIRCLE_R = 8;
const CIRCLE_SPACING = 28;
const SVG_HEIGHT = 32;

function getWeekDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function DayIcon({ cx, cy, status, color }: { cx: number; cy: number; status: string | undefined; color: string }) {
  if (status === 'completed') {
    return <SvgCircle cx={cx} cy={cy} r={CIRCLE_R} fill={color} />;
  }

  if (status === 'saver_used') {
    return (
      <>
        <SvgCircle cx={cx} cy={cy} r={CIRCLE_R} fill="none" stroke={palette.border} strokeWidth={1.5} />
        <SvgPath
          d={`M ${cx},${cy - CIRCLE_R} A ${CIRCLE_R},${CIRCLE_R} 0 0,0 ${cx},${cy + CIRCLE_R} Z`}
          fill={color}
        />
      </>
    );
  }

  return <SvgCircle cx={cx} cy={cy} r={CIRCLE_R} fill="none" stroke={palette.border} strokeWidth={1.5} />;
}

export default function HabitRow({ habit, weekLogs }: HabitRowProps) {
  const allLogs = useHabitStore((s) => s.logs);
  const habitLogs = useMemo(
    () => allLogs.filter((l) => l.habit_id === habit.id),
    [allLogs, habit.id],
  );
  const streak = useMemo(
    () => calculateCurrentStreak(habit, habitLogs),
    [habit, habitLogs],
  );

  const weekDates = getWeekDates();
  const dateMap = new Map<string, string>();
  for (const log of weekLogs) {
    dateMap.set(log.date, log.status);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = dateMap.get(todayStr);
  const isCompletedToday = todayLog === 'completed';

  const handleLogToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useHabitStore.getState().logHabitStatus({
      habitId: habit.id,
      date: todayStr,
      status: 'completed',
    });
  };

  const svgWidth = CIRCLE_SPACING * 7;
  const cy = SVG_HEIGHT / 2;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={[styles.streakBadge, { backgroundColor: habit.color + '20' }]}>
            <Text style={[styles.streakText, { color: habit.color }]}>{streak}</Text>
            <Text style={styles.streakUnit}>day</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.logButton, isCompletedToday && styles.logButtonDone]}
          onPress={handleLogToday}
          activeOpacity={0.7}
          disabled={isCompletedToday}
        >
          <Text style={[styles.logButtonText, isCompletedToday && styles.logButtonTextDone]}>
            {isCompletedToday ? 'Done' : 'Log Today'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        <Svg width={svgWidth} height={SVG_HEIGHT}>
          {weekDates.map((date, index) => {
            const status = dateMap.get(date);
            const cx = index * CIRCLE_SPACING + CIRCLE_R;
            return <DayIcon key={date} cx={cx} cy={cy} status={status} color={habit.color} />;
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  habitName: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    gap: 3,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  streakUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  logButton: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  logButtonDone: {
    backgroundColor: palette.border,
  },
  logButtonText: {
    color: palette.background,
    fontSize: 13,
    fontWeight: '600',
  },
  logButtonTextDone: {
    color: palette.textSecondary,
  },
  weekRow: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});