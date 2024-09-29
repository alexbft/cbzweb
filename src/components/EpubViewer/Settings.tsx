import { ALargeSmallIcon } from "lucide-react";
import { Slider } from "../ui/slider";
import { useAppConfig } from "@/hooks/useAppConfig";
import { appConfigDefaults } from "@/types/AppConfig";

export function Settings() {
  const { fontSize, setFontSize } = useAppConfig();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="cursor-pointer" onClick={() => {
          setFontSize(appConfigDefaults.fontSize)
        }}>
          <ALargeSmallIcon className="size-8" />
        </label>
        <Slider
          className="w-[400px]"
          min={6}
          max={72}
          step={0.1}
          value={[fontSize]}
          onValueChange={([value]) => setFontSize(value)}
        />
      </div>
      <div>
        <label htmlFor="line-height">Line height</label>
        <input type="range" id="line-height" min="1" max="3" step="0.1" />
      </div>
      <div>
        <label htmlFor="font-family">Font family</label>
        <select id="font-family">
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>
    </div>
  );
}