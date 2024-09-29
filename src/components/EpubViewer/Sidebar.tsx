import { EpubContent } from "@/helpers/EpubContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ColorScheme } from "@/types/ColorScheme";
import { MoonIcon, SunIcon } from "lucide-react";
import { TableOfContents } from "./TableOfContents";
import { Settings } from "./Settings";

export interface SidebarProps {
  tab: string;
  onTabChange: (tab: string) => void;
  book: EpubContent | null;
  onLinkClick: (href: string) => void;
}

export function Sidebar({ tab, onTabChange, book, onLinkClick }: SidebarProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <div className="flex flex-col gap-4 h-full">
      <Tabs value={colorScheme} onValueChange={(value) => setColorScheme(value as ColorScheme)}>
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger className="gap-1" value="light"><SunIcon className="size-4" />Light</TabsTrigger>
          <TabsTrigger className="gap-1" value="dark"><MoonIcon className="size-4" />Dark</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs className="flex-1 flex flex-col gap-4 items-start" value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="toc">Book contents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="toc" className="flex-1 self-stretch overflow-y-auto">
          {book ? (
            <TableOfContents items={book.toc} onClick={onLinkClick} />
          ) : (
            <div>Loading...</div>
          )}
        </TabsContent>
        <TabsContent value="settings" className="flex-1 self-stretch overflow-y-auto">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  )
}