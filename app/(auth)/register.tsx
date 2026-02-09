import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/config/routes';
import { colors, styles } from './register.styles';

export default function RegisterScreen() {
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace(ROUTES.LOGIN)}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.langSelector}>
          <Pressable
            onPress={() => setLocale('es')}
            style={[styles.langButton, locale === 'es' && styles.langButtonActive]}
          >
            <Text style={[styles.langButtonText, locale === 'es' && styles.langButtonTextActive]}>
              ES
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('en')}
            style={[styles.langButton, locale === 'en' && styles.langButtonActive]}
          >
            <Text style={[styles.langButtonText, locale === 'en' && styles.langButtonTextActive]}>
              EN
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.logoBlock}>
          <Text style={styles.logoBrand}>sazón</Text>
          <Text style={styles.logoRestobar}>restobar</Text>
        </View>
        <Text style={styles.title}>{t('register.title')}</Text>
        <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>{t('register.backToLogin')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
