import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.welcome')}</Text>
      <Text style={styles.text}>{t('home.user')}: {user?.email ?? '—'}</Text>

      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>{t('home.logout')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 20 },
  button: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#111' },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
