export function FilePicker({ onFileChange }: { onFileChange: (file: File) => void }) {
  return (
    <input
      type="file"
      accept=".cbz"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onFileChange(file);
        }
      }}
    />
  );
}