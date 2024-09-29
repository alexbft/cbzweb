import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ColorScheme } from "@/types/ColorScheme";

export function Sidebar() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <Tabs value={colorScheme} onValueChange={(value) => setColorScheme(value as ColorScheme)}>
      <TabsList>
        <TabsTrigger value="system">System</TabsTrigger>
        <TabsTrigger value="light">Light</TabsTrigger>
        <TabsTrigger value="dark">Dark</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}