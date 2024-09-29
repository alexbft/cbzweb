import { AppConfigContext, AppConfigController, appConfigDefaults } from "@/types/AppConfig";
import { PropsWithChildren, useState } from "react";

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [fontSize, setFontSize] = useState(() => {
    const storedValue = localStorage.getItem("fontSize");
    if (storedValue !== null) {
      const parsedValue = parseInt(storedValue, 10);
      if (parsedValue >= 6 && parsedValue <= 48) {
        return parsedValue;
      }
    }
    return appConfigDefaults.fontSize;
  });
  const [globalUserCss, setGlobalUserCss] = useState(() => {
    return localStorage.getItem("globalUserCss") ?? appConfigDefaults.globalUserCss;
  });

  const controller: AppConfigController = {
    fontSize,
    setFontSize: (value) => {
      localStorage.setItem("fontSize", value.toString());
      setFontSize(value);
    },
    globalUserCss,
    setGlobalUserCss: (value) => {
      localStorage.setItem("globalUserCss", value);
      setGlobalUserCss(value);
    },
  };

  return (
    <AppConfigContext.Provider value={controller}>
      {children}
    </AppConfigContext.Provider>
  );
}