export function PageView({ imageUrl, onClick }: { imageUrl: string, onClick: () => void }) {
  return <img src={imageUrl} onClick={onClick} />
}