// app/_layout.jsx  [ATUALIZADO — inclui rota /settings]

import { Stack }     from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS }    from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack
        screenOptions={{
          headerShown:  false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation:    'slide_from_right',
        }}
      >
        {/* Onboarding / redirecionador */}
        <Stack.Screen name="index"    options={{ animation: 'none' }} />

        {/* Telas principais */}
        <Stack.Screen name="library"  options={{ animation: 'none' }} />
        <Stack.Screen name="folder"   options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="reader"   options={{ animation: 'fade' }} />

        {/* Configurações — sobe do rodapé */}
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}