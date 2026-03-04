import 'react-native-gesture-handler';
import { StatusBar }          from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider }   from 'react-native-safe-area-context';
import AppNavigator           from './src/navigation/AppNavigator';
import { COLORS }             from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary:      COLORS.accent,
            background:   COLORS.bg,
            card:         COLORS.bgSecondary,
            text:         COLORS.textPrimary,
            border:       COLORS.border,
            notification: COLORS.accent,
          },
        }}
      >
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}