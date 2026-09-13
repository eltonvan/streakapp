import { useEffect, useMemo, useState } from 'react';
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

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const loadData = useHabitStore((s) => s.loadData);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const handleFabPress = () => {
    if (habits.length >= 3) {
      setShowPaywall(true);
    } else {
      navigation.navigate('AddHabit');
    }
  };

  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const sevenDaysAgo = formatDate(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
  const todayStr = formatDate(today);

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

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <HabitRow habit={item} weekLogs={logsByHabit.get(item.id) || []} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first habit</Text>
          </View>
        }
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