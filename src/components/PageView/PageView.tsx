export function PageView({ imageUrl, onClick }: { imageUrl: string, onClick: () => void }) {
  return (
    <img
      className="absolute top-0 left-0 h-dvh w-dvw object-contain"
      src={imageUrl}
      onClick={onClick}
    />
  );
}