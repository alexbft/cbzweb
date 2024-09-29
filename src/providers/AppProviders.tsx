import { PropsWithChildren } from "react";
import { ColorSchemeProvider } from "./ColorSchemeProvider";
import { AppConfigProvider } from "./AppConfigProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ColorSchemeProvider>
      <AppConfigProvider>
        {children}
      </AppConfigProvider>
    </ColorSchemeProvider>
  )
}