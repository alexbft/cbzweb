import { useState } from 'react';
import { FilePicker } from './components/FilePicker/FilePicker';
import { Viewer } from './components/Viewer/Viewer';
import { setDefaultTitle } from './helpers/setTitle';

function App() {
  const [autoLoadRecent, setAutoLoadRecent] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    setAutoLoadRecent(false);
    setFile(null);
    setDefaultTitle();
  };

  return (
    file ?
      <Viewer file={file} onClose={handleClose} />
      : <FilePicker autoLoadRecent={autoLoadRecent} onFileChange={setFile} />
  );
}

export default App;
