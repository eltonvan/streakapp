import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { palette, spacing, radius } from '../theme/theme';
import { useHabitStore } from '../store/useHabitStore';
import { calculateCurrentStreak } from '../utils/streakEngine';

const NEON = {
  purple: '#A855F7',
  orange: '#F97316',
  cyan: '#22D3EE',
  emerald: '#10B981',
};

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: accent, borderTopWidth: 2 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

export default function ReportScreen() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);

  const totalHabits = habits.length;
  const totalCompletions = logs.filter(
    (l) => l.status === 'completed' || l.status === 'saver_used',
  ).length;

  const streaks = useMemo(() => {
    return habits.map((h) =>
      calculateCurrentStreak(h, logs.filter((l) => l.habit_id === h.id)),
    );
  }, [habits, logs]);

  const longestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
  const avgStreak = streaks.length > 0
    ? Math.round(streaks.reduce((sum, s) => sum + s, 0) / streaks.length)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Analytics</Text>

      {/* Consistency Score */}
      <View style={styles.consistencyCard}>
        <Text style={styles.consistencyLabel}>Consistency Score</Text>
        <View style={styles.consistencyBarContainer}>
          <View style={styles.consistencyBarTrack}>
            <View style={[styles.consistencyBarFill, { width: '42%' }]} />
          </View>
          <Text style={styles.consistencyPercent}>42%</Text>
        </View>
      </View>

      {/* Habit Wheel + 2x2 grid */}
      <View style={styles.bentoRow}>
        {/* Large square Habit Wheel */}
        <View style={styles.habitWheel}>
          <Text style={styles.placeholderIcon}>◎</Text>
          <Text style={styles.placeholderText}>Habit Wheel</Text>
        </View>

        {/* 2x2 grid */}
        <View style={styles.grid2x2}>
          <StatCard label="Total Habits" value={String(totalHabits)} accent={NEON.purple} />
          <StatCard label="Completions" value={String(totalCompletions)} accent={NEON.orange} />
          <StatCard label="Avg Streak" value={String(avgStreak)} accent={NEON.cyan} />
          <StatCard label="Longest Streak" value={String(longestStreak)} accent={NEON.emerald} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  heading: {
    color: palette.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  consistencyCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  consistencyLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  consistencyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  consistencyBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  consistencyBarFill: {
    height: '100%',
    backgroundColor: NEON.purple,
    borderRadius: 4,
  },
  consistencyPercent: {
    color: NEON.purple,
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  habitWheel: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    color: palette.border,
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  grid2x2: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '47%',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    justifyContent: 'center',
  },
  statLabel: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});