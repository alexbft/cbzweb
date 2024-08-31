export function PageView({ imageUrl, onChangePage, height }: {
  imageUrl: string;
  onChangePage: (delta: number) => void;
  height: number;
}) {
  return (
    <img
      className="absolute top-0 left-0 w-screen object-contain"
      style={{ height }}
      src={imageUrl}
      onClick={() => onChangePage(1)}
      onWheel={(e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
          return;
        }
        onChangePage(e.deltaY > 0 ? 1 : -1)
      }}
    />
  );
}