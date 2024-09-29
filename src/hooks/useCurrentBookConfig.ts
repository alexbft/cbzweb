import { CurrentBookConfigContext } from "@/types/CurrentBookConfig";
import { useContext } from "react";

export function useCurrentBookConfig() {
  return useContext(CurrentBookConfigContext);
}