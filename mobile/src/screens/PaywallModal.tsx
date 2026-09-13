import { useState } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, Pressable, Alert } from 'react-native';
import { palette, spacing, radius } from '../theme/theme';
import { useHabitStore } from '../store/useHabitStore';
import { purchaseYearly, purchaseLifetime, restorePurchases } from '../services/purchases';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const [isPending, setIsPending] = useState(false);
  const setSubscriptionTier = useHabitStore((s) => s.setSubscriptionTier);

  const handlePurchase = async (fn: () => Promise<{ success: boolean; tier: string }>) => {
    if (isPending) return;
    setIsPending(true);
    try {
      const result = await fn();
      if (result.success) {
        setSubscriptionTier(result.tier as 'free' | 'pro_yearly' | 'pro_lifetime');
        onClose();
      } else {
        Alert.alert('Purchase failed', 'Please try again later.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const handleRestore = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      const result = await restorePurchases();
      if (result.success) {
        setSubscriptionTier(result.tier);
        onClose();
      } else {
        Alert.alert('No purchases found', 'No active subscriptions to restore.');
      }
    } catch {
      Alert.alert('Error', 'Unable to restore purchases.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Unlock Full Access</Text>
          <Text style={styles.subtitle}>Free tier limited to 3 habits. Upgrade for unlimited streaks.</Text>

          <View style={styles.plansRow}>
            <TouchableOpacity
              style={[styles.planCard, styles.planHighlight]}
              onPress={() => handlePurchase(purchaseYearly)}
              activeOpacity={0.7}
              disabled={isPending}
            >
              <Text style={styles.planBadge}>RECOMMENDED</Text>
              <Text style={styles.planName}>Pro Yearly</Text>
              <Text style={styles.planPrice}>€9<Text style={styles.planPriceUnit}>/year</Text></Text>
              {isPending && <Text style={styles.pendingText}>Processing...</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.planCard}
              onPress={() => handlePurchase(purchaseLifetime)}
              activeOpacity={0.7}
              disabled={isPending}
            >
              <Text style={styles.planName}>Lifetime</Text>
              <Text style={styles.planPrice}>€35<Text style={styles.planPriceUnit}> once</Text></Text>
              {isPending && <Text style={styles.pendingText}>Processing...</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            Local app features guaranteed, cloud backup services subject to change.
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            activeOpacity={0.7}
            disabled={isPending}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7} disabled={isPending}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  plansRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  planHighlight: {
    borderColor: '#A855F7',
    borderWidth: 1.5,
  },
  planBadge: {
    color: '#A855F7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  planName: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  planPrice: {
    color: '#A855F7',
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  planPriceUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  pendingText: {
    color: palette.textSecondary,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  disclaimer: {
    color: palette.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  restoreButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  restoreText: {
    color: '#A855F7',
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
  },
  closeButtonText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});