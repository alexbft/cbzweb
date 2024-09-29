import { ColorScheme, ColorSchemeContext, ColorSchemeProviderState } from "@/types/ColorScheme"
import { useEffect, useState } from "react"

type ColorSchemeProviderProps = {
  children: React.ReactNode
  defaultColorScheme?: ColorScheme
  storageKey?: string
}

export function ColorSchemeProvider({
  children,
  defaultColorScheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ColorSchemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    () => (localStorage.getItem(storageKey) as ColorScheme) || defaultColorScheme
  );
  const [computedColorScheme, setComputedColorScheme] = useState<ColorScheme>(colorScheme === "system" ? "light" : colorScheme);

  useEffect(() => {
    if (colorScheme === "system") {
      const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      setComputedColorScheme(systemColorScheme);
    } else {
      setComputedColorScheme(colorScheme);
    }
  }, [colorScheme]);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark")
    root.classList.add(computedColorScheme);
  }, [computedColorScheme]);

  const value = {
    colorScheme,
    computedColorScheme,
    setColorScheme: (colorScheme: ColorScheme) => {
      localStorage.setItem(storageKey, colorScheme)
      setColorScheme(colorScheme)
    },
  } satisfies ColorSchemeProviderState;

  return (
    <ColorSchemeContext.Provider {...props} value={value} >
      {children}
    </ColorSchemeContext.Provider>
  );
}