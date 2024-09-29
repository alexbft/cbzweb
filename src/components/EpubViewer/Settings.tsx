import { ALargeSmallIcon } from "lucide-react";
import { Slider } from "../ui/slider";
import { useAppConfig } from "@/hooks/useAppConfig";
import { appConfigDefaults } from "@/types/AppConfig";
import { Textarea } from "../ui/textarea";
import { useCurrentBookConfig } from "@/hooks/useCurrentBookConfig";

export function Settings() {
  const { fontSize, setFontSize, globalUserCss, setGlobalUserCss } = useAppConfig();

  const currentBookConfig = useCurrentBookConfig();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <label className="cursor-pointer" onClick={() => {
          setFontSize(appConfigDefaults.fontSize)
        }}>
          <ALargeSmallIcon className="size-8" />
        </label>
        <Slider
          className="w-[350px]"
          min={6}
          max={48}
          step={0.1}
          value={[fontSize]}
          onValueChange={([value]) => setFontSize(value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label>Custom CSS (all books)</label>
        <Textarea className="w-[350px] h-[200px] p-2 font-mono whitespace-pre resize bg-gray-100 dark:bg-gray-800"
          defaultValue={globalUserCss}
          onBlur={(e) => {
            setGlobalUserCss(e.target.value);
          }} />
      </div>
      <div className="flex flex-col gap-2">
        <label>Custom CSS (this book only)</label>
        <Textarea className="w-[350px] h-[200px] p-2 font-mono whitespace-pre resize bg-gray-100 dark:bg-gray-800"
          defaultValue={currentBookConfig?.userCss}
          onBlur={(e) => {
            currentBookConfig?.setUserCss(e.target.value);
          }} />
      </div>
    </div>
  );
}