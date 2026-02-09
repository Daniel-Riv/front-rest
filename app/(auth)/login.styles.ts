import { StyleSheet, Platform } from 'react-native';

export const colors = {
  background: '#F5F5F5',
  backgroundDots: '#E8E8E8',
  surface: '#FFFFFF',
  primary: '#DC2655',
  primaryDark: '#B81E45',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
  border: '#D4D4D4',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  linkBlue: '#0EA5E9',
  linkRed: '#DC2655',
};

export const MIN_WIDTH_TWO_COLUMNS = 640;

export const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dotsBackground: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    paddingVertical: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.backgroundDots,
    opacity: 0.8,
  },
  dotAlternate: {
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 48,
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  langButton: {
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  langButtonTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardRow: {
    flexDirection: 'row',
  },
  formSection: {
    padding: 24,
  },
  formSectionSide: {
    flex: 0.45,
    minWidth: 280,
  },
  logoBlock: {
    marginBottom: 20,
  },
  logoBrand: {
    fontSize: 32,
    fontWeight: '400',
    color: colors.text,
    letterSpacing: -0.5,
  },
  logoRestobar: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
    marginTop: -4,
    marginLeft: 2,
  },
  welcome: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  welcomeTitleRed: {
    color: colors.primary,
  },
  instruction: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: colors.error,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    minHeight: 50,
    marginBottom: 16,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  link: {
    marginBottom: 8,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkBlue: {
    color: colors.linkBlue,
  },
  linkRed: {
    color: colors.linkRed,
  },
  promo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
  promoLink: {
    color: colors.linkBlue,
    textDecorationLine: 'underline',
  },
  visualSection: {
    height: 120,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'relative',
  },
  visualSectionSide: {
    flex: 0.55,
    minWidth: 280,
    height: 'auto',
    minHeight: 400,
    borderTopWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  visualDots: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 24,
    paddingRight: 24,
    alignItems: 'flex-end',
    opacity: 0.5,
  },
  visualDotsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  visualDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.backgroundDots,
    marginRight: 6,
  },
  visualShapes: {
    ...StyleSheet.absoluteFillObject,
  },
  shape: {
    position: 'absolute',
    backgroundColor: 'rgba(240,240,240,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  shape1: {
    width: 100,
    height: 100,
    borderRadius: 24,
    top: '40%',
    right: '15%',
    transform: [{ rotate: '-8deg' }],
  },
  shape2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: '35%',
    right: '35%',
    transform: [{ rotate: '5deg' }],
  },
  shape3: {
    width: 70,
    height: 70,
    borderRadius: 16,
    top: '45%',
    right: '50%',
    transform: [{ rotate: '-3deg' }],
  },
  bubbleIcon: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    marginLeft: -32,
    opacity: 0.35,
  },
  forkOverlay: {
    position: 'absolute',
    right: -8,
    top: 8,
  },
  footer: {
    marginTop: 24,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
