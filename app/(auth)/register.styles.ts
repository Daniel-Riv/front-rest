import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#DC2655',
  text: '#2D2D2D',
  textMuted: '#6B6B6B',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  langSelector: {
    flexDirection: 'row',
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    marginLeft: 8,
  },
  langButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  langButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logoBlock: {
    marginBottom: 24,
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
