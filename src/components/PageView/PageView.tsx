export function PageView({ imageUrl, onClick, height }: {
  imageUrl: string;
  onClick: () => void;
  height: number;
}) {
  return (
    <img
      className="absolute top-0 left-0 w-screen object-contain"
      style={{ height }}
      src={imageUrl}
      onClick={onClick}
    />
  );
}