import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen    from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ReaderScreen  from '../screens/ReaderScreen';
import { COLORS }    from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation:    'slide_from_right',
      }}
    >
      <Stack.Screen name="Home"    component={HomeScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}