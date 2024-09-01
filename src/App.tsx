import { useState } from 'react';
import { FilePicker } from './components/FilePicker/FilePicker';
import { Viewer } from './components/Viewer/Viewer';

function App() {
  const [autoLoadRecent, setAutoLoadRecent] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    setAutoLoadRecent(false);
    setFile(null);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 pt-8">
      {file ?
        <Viewer file={file} onClose={handleClose} />
        : <FilePicker autoLoadRecent={autoLoadRecent} onFileChange={setFile} />}
    </div>
  );
}

export default App;
