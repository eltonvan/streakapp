import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { palette, spacing, radius } from '../theme/theme';
import { useHabitStore } from '../store/useHabitStore';

const COLORS = ['#A855F7', '#EF4444', '#F97316', '#22D3EE', '#10B981', '#F59E0B'];
const ACCENT = '#A855F7';

export default function AddHabitScreen() {
  const navigation = useNavigation();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [saverGoal, setSaverGoal] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [habitType, setHabitType] = useState<'standard' | 'stretched'>('standard');

  const canSave = name.trim().length > 0 && targetGoal.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    await addHabit({
      name: name.trim(),
      color: selectedColor,
      targetGoal: Number(targetGoal),
      saverGoal: Number(saverGoal) || 0,
      type: habitType,
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>X</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Streak</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Streak name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning Run"
            placeholderTextColor={palette.textSecondary}
          />
        </View>

        <View style={styles.goalsRow}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Target Goal</Text>
            <TextInput
              style={styles.input}
              value={targetGoal}
              onChangeText={setTargetGoal}
              placeholder="e.g. 5km"
              placeholderTextColor={palette.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Saver Goal</Text>
            <TextInput
              style={styles.input}
              value={saverGoal}
              onChangeText={setSaverGoal}
              placeholder="e.g. 1km"
              placeholderTextColor={palette.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
            {COLORS.map((color) => {
              const selected = color === selectedColor;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selected && styles.colorSwatchSelected,
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Habit Type</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, habitType === 'standard' && styles.segmentActive]}
              onPress={() => setHabitType('standard')}
            >
              <Text style={[styles.segmentText, habitType === 'standard' && styles.segmentTextActive]}>
                Standard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, habitType === 'stretched' && styles.segmentActive]}
              onPress={() => setHabitType('stretched')}
            >
              <Text style={[styles.segmentText, habitType === 'stretched' && styles.segmentTextActive]}>
                Stretched
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>Save Streak</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  label: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: palette.white,
    fontSize: 16,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: palette.white,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md - 2,
  },
  segmentActive: {
    backgroundColor: ACCENT,
  },
  segmentText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: palette.white,
  },
  bottomBar: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  saveButton: {
    backgroundColor: ACCENT,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: palette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: palette.white,
    fontSize: 17,
    fontWeight: '700',
  },
});