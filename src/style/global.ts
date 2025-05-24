import { StyleSheet } from 'react-native';
import { ThemeType } from '../types/theme';

export const globalStyles = (theme: ThemeType, fontSize: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 10,
  },
  title: {
    fontSize: fontSize + 4,
    color: theme.text,
    fontWeight: 'bold',
  },
  text: {
    fontSize: fontSize,
    color: theme.text,
  },
  secondaryText: {
    fontSize: fontSize - 2,
    color: theme.secondaryText,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    padding: 10,
    color: theme.text,
    marginVertical: 5,
  },
  button: {
    backgroundColor: theme.accent,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize,
  },
});