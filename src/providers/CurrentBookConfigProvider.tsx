import { CurrentBookConfigContext, CurrentBookConfigController } from "@/types/CurrentBookConfig";
import { get, set } from "idb-keyval";
import { PropsWithChildren, useEffect, useState } from "react";

export type CurrentBookConfigProviderProps = PropsWithChildren<{
  idbKey: IDBValidKey;
}>;

export function CurrentBookConfigProvider({ idbKey, children }: CurrentBookConfigProviderProps) {
  const [userCss, setUserCss] = useState("");

  const userCssKey = [idbKey, "userCss"];

  useEffect(() => {
    async function loadUserCss() {
      const userCss = await get<string>(userCssKey);
      if (userCss !== undefined) {
        setUserCss(userCss);
      }
    }

    loadUserCss();
  }, [idbKey]);

  const controller = {
    userCss,
    setUserCss: (value: string) => {
      setUserCss(value);
      return set(userCssKey, value);
    },
  } as CurrentBookConfigController;

  return (
    <CurrentBookConfigContext.Provider value={controller}>
      {children}
    </CurrentBookConfigContext.Provider>
  );
}
