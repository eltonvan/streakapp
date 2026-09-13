import { useEffect, useMemo, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette, spacing, radius } from '../theme/theme';
import { useHabitStore } from '../store/useHabitStore';
import HabitRow from '../components/HabitRow';
import PaywallModal from './PaywallModal';
import type { HomeStackParamList } from '../navigation/HomeStack';

type Nav = NativeStackNavigationProp<HomeStackParamList>;
const ACCENT = '#A855F7';

function EmptyList() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No habits yet</Text>
      <Text style={styles.emptySubtext}>Tap + to create your first habit</Text>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const loadData = useHabitStore((s) => s.loadData);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFabPress = useCallback(() => {
    if (habits.length >= 3) {
      setShowPaywall(true);
    } else {
      navigation.navigate('AddHabit');
    }
  }, [habits.length, navigation]);

  const { todayStr, sevenDaysAgo } = useMemo(() => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return {
      todayStr: fmt(today),
      sevenDaysAgo: fmt(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
    };
  }, []);

  const logsByHabit = useMemo(() => {
    const map = new Map<string, typeof logs>();
    for (const log of logs) {
      if (log.date >= sevenDaysAgo && log.date <= todayStr) {
        const existing = map.get(log.habit_id) || [];
        existing.push(log);
        map.set(log.habit_id, existing);
      }
    }
    return map;
  }, [logs, sevenDaysAgo, todayStr]);

  const emptyLogs: typeof logs = useMemo(() => [], []);

  const renderItem = useCallback(
    ({ item }: { item: (typeof habits)[number] }) => (
      <HabitRow habit={item} weekLogs={logsByHabit.get(item.id) || emptyLogs} />
    ),
    [logsByHabit, emptyLogs],
  );

  const keyExtractor = useCallback((item: (typeof habits)[number]) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={EmptyList}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleFabPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});