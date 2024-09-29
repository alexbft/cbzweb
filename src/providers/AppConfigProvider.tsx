import { AppConfigContext, AppConfigController, appConfigDefaults } from "@/types/AppConfig";
import { PropsWithChildren, useState } from "react";

export function AppConfigProvider({ children }: PropsWithChildren) {
  const [fontSize, setFontSize] = useState(appConfigDefaults.fontSize);

  const controller: AppConfigController = {
    fontSize,
    setFontSize,
  };

  return (
    <AppConfigContext.Provider value={controller}>
      {children}
    </AppConfigContext.Provider>
  );
}