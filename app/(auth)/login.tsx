import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getLoginSchema, type LoginForm } from '@/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/config/routes';
import { colors, styles, MIN_WIDTH_TWO_COLUMNS } from './login.styles';

export default function LoginScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { login, status } = useAuthStore();
  const loading = status === 'loading';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [rememberPassword, setRememberPassword] = useState(false);
  const { width } = useWindowDimensions();
  const isTwoColumns = width >= MIN_WIDTH_TWO_COLUMNS;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <KeyboardAvoidingView
      key={locale}
      style={[styles.wrapper, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Fondo con patrón de puntos */}
      <View style={styles.dotsBackground}>
        {Array.from({ length: 12 }).map((_, row) => (
          <View key={row} style={styles.dotsRow}>
            {Array.from({ length: 10 }).map((_, col) => (
              <View
                key={col}
                style={[
                  styles.dot,
                  (row + col) % 2 === 0 && styles.dotAlternate,
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Selector de idioma */}
        <View style={styles.langSelector}>
          <Pressable
            onPress={() => setLocale('es')}
            style={[styles.langButton, locale === 'es' && styles.langButtonActive]}
          >
            <Text
              style={[
                styles.langButtonText,
                locale === 'es' && styles.langButtonTextActive,
              ]}
            >
              ES
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setLocale('en')}
            style={[styles.langButton, locale === 'en' && styles.langButtonActive]}
          >
            <Text
              style={[
                styles.langButtonText,
                locale === 'en' && styles.langButtonTextActive,
              ]}
            >
              EN
            </Text>
          </Pressable>
        </View>

        {/* Tarjeta principal - dos columnas: login izquierda, imagen derecha */}
        <View style={[styles.card, isTwoColumns && styles.cardRow]}>
          <View style={[styles.formSection, isTwoColumns && styles.formSectionSide]}>
            {/* Logo */}
            <View style={styles.logoBlock}>
              <Text style={styles.logoBrand}>sazón</Text>
              <Text style={styles.logoRestobar}>restobar</Text>
            </View>

            {/* Bienvenida */}
            <Text style={styles.welcome}>{t('login.welcome')}</Text>
            <Text style={styles.welcomeTitle}>
              Sazón <Text style={styles.welcomeTitleRed}>Restobar</Text>
            </Text>
            <Text style={styles.instruction}>{t('login.instruction')}</Text>

            {/* Campos */}
            <View style={styles.field}>
              <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                <Feather
                  name="mail"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      placeholder={t('login.email')}
                      placeholderTextColor={colors.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!loading}
                    />
                  )}
                />
              </View>
              {errors.email ? (
                <Text style={styles.error}>{errors.email.message}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                <Feather
                  name="lock"
                  size={18}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      secureTextEntry
                      autoComplete="password"
                      placeholder={t('login.password')}
                      placeholderTextColor={colors.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      editable={!loading}
                    />
                  )}
                />
              </View>
              {errors.password ? (
                <Text style={styles.error}>{errors.password.message}</Text>
              ) : null}
            </View>

            {/* Recordar contraseña */}
            <Pressable
              style={styles.checkboxRow}
              onPress={() => setRememberPassword(!rememberPassword)}
            >
              <View style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}>
                {rememberPassword && (
                  <Feather name="check" size={12} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{t('login.rememberPassword')}</Text>
            </Pressable>

            {/* Botón Ingresar */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading ? styles.buttonDisabled : null,
                pressed && !loading ? styles.buttonPressed : null,
              ]}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('login.submit')}</Text>
              )}
            </Pressable>

            {/* Enlaces */}
            <Pressable
              onPress={() =>
                Alert.alert(t('login.forgotPasswordTitle'), t('login.forgotPasswordMessage'))
              }
              style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            >
              <Text style={[styles.linkText, styles.linkBlue]}>
                {t('login.forgotPassword')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push(ROUTES.REGISTER)}
              style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
            >
              <Text style={[styles.linkText, styles.linkRed]}>
                {t('login.createAccount')}
              </Text>
            </Pressable>

            {/* Promocional */}
            <Text style={styles.promo}>
              {t('login.noAccountYet')}{' '}
              <Text
                style={styles.promoLink}
                onPress={() => router.push(ROUTES.REGISTER)}
              >
                {t('login.tryFree')}
              </Text>
            </Text>
            <Text style={styles.promo}>
              {t('login.goToSite')}{' '}
              <Text
                style={styles.promoLink}
                onPress={() => Linking.openURL('https://sazon.app')}
              >
                {t('login.clickHere')}
              </Text>
            </Text>
          </View>

          {/* Sección visual - imagen derecha (formas superpuestas + icono) */}
          <View style={[styles.visualSection, isTwoColumns && styles.visualSectionSide]}>
            {isTwoColumns && (
              <View style={styles.visualDots}>
                {Array.from({ length: 6 }).map((_, r) => (
                  <View key={r} style={styles.visualDotsRow}>
                    {Array.from({ length: 5 }).map((_, c) => (
                      <View key={c} style={styles.visualDot} />
                    ))}
                  </View>
                ))}
              </View>
            )}
            <View style={styles.visualShapes}>
              <View style={[styles.shape, styles.shape1]} />
              <View style={[styles.shape, styles.shape2]} />
              <View style={[styles.shape, styles.shape3]} />
            </View>
            <View style={styles.bubbleIcon}>
              <Feather name="message-circle" size={64} color={colors.backgroundDots} />
              <View style={styles.forkOverlay}>
                <Feather name="coffee" size={20} color={colors.backgroundDots} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{t('common.footer')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
