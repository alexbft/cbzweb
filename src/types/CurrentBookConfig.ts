import { createContext } from "react";

export interface CurrentBookConfig {
  userCss: string;
}

export type CurrentBookConfigController = {
  [key in keyof CurrentBookConfig]: CurrentBookConfig[key];
} & {
  [key in keyof CurrentBookConfig as `set${Capitalize<string & key>}`]: (value: CurrentBookConfig[key]) => void;
};

export const CurrentBookConfigContext = createContext<CurrentBookConfigController | null>(null);