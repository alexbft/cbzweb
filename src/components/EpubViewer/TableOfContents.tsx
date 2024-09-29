import { EpubManifestItem } from "@/types/EpubManifestItem";

export function TableOfContents({ items, onClick }: { items: EpubManifestItem[]; onClick: (href: string) => void }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <a
            className="text-link dark:text-link-dark block cursor-pointer px-4 py-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.preventDefault();
              onClick(item.href);
            }}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}