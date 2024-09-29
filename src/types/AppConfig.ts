import { createContext } from "react";

export interface AppConfig {
  fontSize: number;
}

export type AppConfigController = {
  [key in keyof AppConfig]: AppConfig[key];
} & {
  [key in keyof AppConfig as `set${Capitalize<string & key>}`]: (value: AppConfig[key]) => void;
};

export const AppConfigContext = createContext<AppConfigController>({} as AppConfigController);

export const appConfigDefaults: AppConfig = {
  fontSize: 16,
};