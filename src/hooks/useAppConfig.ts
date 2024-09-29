import { AppConfigContext } from "@/types/AppConfig";
import { useContext } from "react";

export function useAppConfig() {
  return useContext(AppConfigContext);
}