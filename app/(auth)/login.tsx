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
  const [showPassword, setShowPassword] = useState(false);
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
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.shell, isTwoColumns && styles.shellRow]}>
          <View style={[styles.leftPanel, isTwoColumns && styles.leftPanelDesktop]}>
            <View style={styles.productRow}>
              <View style={styles.productIcon}>
                <Feather name="clipboard" size={26} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.productTitle}>Enterprise Suite</Text>
                <Text style={styles.productSub}>Professional Edition</Text>
              </View>
            </View>

            <Text style={styles.leftHeadline}>{t('login.leftHeadline')}</Text>
            <Text style={styles.leftDescription}>{t('login.leftDescription')}</Text>

            <View style={styles.bulletsWrap}>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot}>
                  <Feather name="check" size={12} color={colors.success} />
                </View>
                <Text style={styles.bulletText}>{t('login.leftBullet1')}</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot}>
                  <Feather name="check" size={12} color={colors.success} />
                </View>
                <Text style={styles.bulletText}>{t('login.leftBullet2')}</Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={styles.bulletDot}>
                  <Feather name="check" size={12} color={colors.success} />
                </View>
                <Text style={styles.bulletText}>{t('login.leftBullet3')}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>{t('login.statsCompanies')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>99.9%</Text>
                <Text style={styles.statLabel}>{t('login.statsUptime')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>{t('login.statsSupport')}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.rightPanel, isTwoColumns && styles.rightPanelDesktop]}>
            <View style={styles.langSelector}>
              <Pressable
                onPress={() => setLocale('es')}
                style={[styles.langButton, locale === 'es' && styles.langButtonActive]}
              >
                <Text style={[styles.langButtonText, locale === 'es' && styles.langButtonTextActive]}>ES</Text>
              </Pressable>
              <Pressable
                onPress={() => setLocale('en')}
                style={[styles.langButton, locale === 'en' && styles.langButtonActive]}
              >
                <Text style={[styles.langButtonText, locale === 'en' && styles.langButtonTextActive]}>EN</Text>
              </Pressable>
            </View>

            <View style={styles.formWrap}>
              <View style={styles.topBadge}>
                <Text style={styles.topBadgeText}>✧ {t('login.securePlatform')}</Text>
              </View>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>

              <Pressable style={styles.socialButtonWide}>
                <Feather name="globe" size={18} color="#475569" />
                <Text style={styles.socialText}>{t('login.continueWithGoogle')}</Text>
              </Pressable>
              <View style={styles.socialButtonHalfRow}>
                <Pressable style={styles.socialButtonHalf}>
                  <Feather name="github" size={18} color="#475569" />
                  <Text style={styles.socialText}>{t('login.continueWithGithub')}</Text>
                </Pressable>
                <Pressable style={styles.socialButtonHalf}>
                  <Feather name="linkedin" size={18} color="#475569" />
                  <Text style={styles.socialText}>{t('login.continueWithLinkedin')}</Text>
                </Pressable>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.orEmail')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>{t('login.corporateEmail')}</Text>
                <View style={[styles.inputFrame, errors.email ? styles.inputError : null]}>
                  <Feather name="mail" size={20} color="#94A3B8" />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        placeholder={t('login.placeholderCorporateEmail')}
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        editable={!loading}
                      />
                    )}
                  />
                </View>
                {errors.email ? <Text style={styles.error}>{errors.email.message}</Text> : null}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>{t('login.password')}</Text>
                <View style={[styles.inputFrame, errors.password ? styles.inputError : null]}>
                  <Feather name="lock" size={20} color="#94A3B8" />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        placeholder="••••••••"
                        placeholderTextColor="#94A3B8"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        editable={!loading}
                      />
                    )}
                  />
                  <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94A3B8" />
                  </Pressable>
                </View>
                {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
              </View>

              <View style={styles.helperRow}>
                <Pressable style={styles.rememberRow} onPress={() => setRememberPassword((prev) => !prev)}>
                  <View style={[styles.checkbox, rememberPassword && styles.checkboxChecked]}>
                    {rememberPassword ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={styles.rememberText}>{t('login.rememberPassword')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert(t('login.forgotPasswordTitle'), t('login.forgotPasswordMessage'))}
                >
                  <Text style={styles.forgotText}>{t('login.forgotQuestion')}</Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && !loading ? styles.submitButtonPressed : null]}
                disabled={loading}
                onPress={handleSubmit(onSubmit)}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {t('login.submit')}  →
                  </Text>
                )}
              </Pressable>

              <View style={styles.secureRow}>
                <Feather name="shield" size={16} color="#22C55E" />
                <Text style={styles.secureText}>{t('login.secureConnection')}</Text>
              </View>

              <View style={styles.requestRow}>
                <Text style={styles.requestPrefix}>{t('login.requestAccessPrefix')}</Text>
                <Pressable onPress={() => router.push(ROUTES.REGISTER)}>
                  <Text style={styles.requestLink}>{t('login.requestAccessLink')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
