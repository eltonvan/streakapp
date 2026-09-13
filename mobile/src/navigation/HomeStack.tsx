import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddHabitScreen from '../screens/AddHabitScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  AddHabit: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}