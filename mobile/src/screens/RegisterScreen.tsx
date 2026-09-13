import { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { palette, spacing, radius } from '../theme/theme';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthStackParamList } from '../navigation/AuthStack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;
const ACCENT = '#A855F7';

function FloatingInput({
  label,
  value,
  onChangeText,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const active = focused || value.length > 0;

  return (
    <View style={styles.inputWrapper}>
      <Animated.Text
        style={{
          position: 'absolute',
          left: spacing.md,
          top: anim.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }),
          fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
          color: active ? ACCENT : palette.textSecondary,
        }}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={[styles.input, active && styles.inputActive]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
        onBlur={() => { if (!value) Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start(); }}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0 && password === confirmPassword;

  const handleRegister = async () => {
    if (!canSubmit || pending) return;
    setPending(true);
    const result = await register(username.trim(), password);
    setPending(false);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start tracking your streaks today</Text>

        <FloatingInput label="Username" value={username} onChangeText={setUsername} />
        <FloatingInput label="Password" value={password} onChangeText={setPassword} secure />
        <FloatingInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secure />

        {confirmPassword.length > 0 && password !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.85}
          disabled={!canSubmit || pending}
        >
          <Text style={styles.buttonText}>{pending ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  title: { color: palette.white, fontSize: 28, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { color: palette.textSecondary, fontSize: 15, marginBottom: spacing.xl },
  inputWrapper: { marginBottom: spacing.lg, justifyContent: 'center', height: 56 },
  input: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    color: palette.white,
    fontSize: 16,
  },
  inputActive: { borderColor: ACCENT },
  button: {
    backgroundColor: ACCENT,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { backgroundColor: palette.border, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: palette.white, fontSize: 17, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { color: palette.textSecondary, fontSize: 14 },
  linkAccent: { color: ACCENT, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: spacing.sm },
});