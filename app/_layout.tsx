import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/config/routes';

export default function RootLayout() {
  const router = useRouter();
  const { bootstrap, status } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Cuando el store esté listo, redirigir según auth
  useEffect(() => {
    if (status === 'authenticated') router.replace(ROUTES.HOME);
    if (status === 'unauthenticated') router.replace(ROUTES.LOGIN);
  }, [status, router]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </SafeAreaProvider>
  );
}
