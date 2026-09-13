import { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette, spacing } from './src/theme/theme';
import TabNavigator from './src/navigation/TabNavigator';
import AuthStack from './src/navigation/AuthStack';
import { useHabitStore } from './src/store/useHabitStore';
import { useAuthStore } from './src/store/useAuthStore';
import { syncWithServer } from './src/services/syncService';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.white,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
    notification: palette.text,
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loadData = useHabitStore((s) => s.loadData);
  const loadToken = useAuthStore((s) => s.loadToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const init = async () => {
      await loadToken();
      if (useAuthStore.getState().isAuthenticated) {
        await loadData();
        await syncWithServer();
      }
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={palette.white} />
        <Text style={styles.loadingText}>Loading Streak</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        {isAuthenticated ? <TabNavigator /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: palette.textSecondary,
    fontSize: 15,
    marginTop: spacing.md,
  },
});