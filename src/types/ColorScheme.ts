import { createContext } from "react";

export type ColorScheme = 'light' | 'dark' | 'system';

export type ColorSchemeProviderState = {
  colorScheme: ColorScheme;
  computedColorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
}

const initialState: ColorSchemeProviderState = {
  colorScheme: "system",
  computedColorScheme: "system",
  setColorScheme: () => null,
}

export const ColorSchemeContext = createContext<ColorSchemeProviderState>(initialState);