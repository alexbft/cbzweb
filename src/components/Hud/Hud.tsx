import { PropsWithChildren } from "react";

export function Hud({ children }: PropsWithChildren) {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none *:pointer-events-auto">
      {children}
    </div>
  );
}