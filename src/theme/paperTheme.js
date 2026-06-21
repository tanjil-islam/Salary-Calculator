// src/theme/paperTheme.js
import { MD3DarkTheme } from "react-native-paper";
import { Colors } from "../constants/colors";

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 16,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.accent,
    background: Colors.bg,
    surface: Colors.card,
    onSurface: Colors.text,
    text: Colors.text,
  },
};
