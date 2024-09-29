import { PropsWithChildren } from "react";
import { ColorSchemeProvider } from "./ColorSchemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ColorSchemeProvider>{children}</ColorSchemeProvider>
  )
}