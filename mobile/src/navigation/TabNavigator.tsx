import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeStack from './HomeStack';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { palette, radius } from '../theme/theme';

const Tab = createBottomTabNavigator();

type TabIconName = 'home' | 'report' | 'profile';

const ICONS: Record<TabIconName, string> = {
  home: '🏠',
  report: '📊',
  profile: '👤',
};

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      <BlurView intensity={40} tint="dark" style={styles.blurPill}>
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const iconName = route.name.toLowerCase() as TabIconName;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={[styles.tabContent, isFocused && styles.tabFocused]}>
                  <Text style={styles.tabIcon}>{ICONS[iconName] || '●'}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && { color: palette.white },
                    ]}
                  >
                    {options.title ?? route.name}
                  </Text>
                  {isFocused && (
                    <View style={styles.activeDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const PILL_HEIGHT = 64;
const PILL_HORIZONTAL_MARGIN = 24;

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: PILL_HORIZONTAL_MARGIN,
    right: PILL_HORIZONTAL_MARGIN,
    height: PILL_HEIGHT,
  },
  blurPill: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: palette.border,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: palette.text,
    fontWeight: '500',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.white,
    marginTop: 3,
  },
});