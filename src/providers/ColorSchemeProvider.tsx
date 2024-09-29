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

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (colorScheme === "system") {
      const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemColorScheme)
      return
    }

    root.classList.add(colorScheme)
  }, [colorScheme]);

  const value = {
    colorScheme,
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