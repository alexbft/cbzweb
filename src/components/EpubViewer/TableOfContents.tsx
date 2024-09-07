import { useState } from "react";
import { Button } from "../ui/button";
import { TableOfContentsIcon } from "lucide-react";
import { EpubManifestItem } from "@/types/EpubManifestItem";

export function TableOfContents({ items, onClick }: { items: EpubManifestItem[]; onClick: (href: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed top-4 left-4 flex flex-col">
      <Button
        className="group size-16 hover:bg-black hover:bg-opacity-25"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TableOfContentsIcon className="text-white opacity-30 group-hover:opacity-100 size-8" />
      </Button>
      {isOpen && (
        <div className="bg-black bg-opacity-95 p-4 rounded-lg">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <Button
                  className="w-full hover:bg-transparent justify-start group"
                  variant="ghost"
                  onClick={() => {
                    onClick(item.href);
                    setIsOpen(false);
                  }}>
                  <span className="text-white group-hover:text-indigo-400">{item.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div >
  );
}