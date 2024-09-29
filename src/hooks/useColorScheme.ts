import { ColorSchemeContext } from "@/types/ColorScheme";
import { useContext } from "react";

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}