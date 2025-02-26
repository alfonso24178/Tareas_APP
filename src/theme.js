// src/theme.ts
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', // Color primario
    accent: '#03dac6', // Color secundario
    background: '#000000', // Fondo
    surface: '#ffffff', // Superficie (tarjetas, etc.)
    text: '#FFFFFF', // Texto principal
  },
};