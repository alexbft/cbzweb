import { useState } from 'react';
import { FilePicker } from './components/FilePicker/FilePicker';
import { Viewer } from './components/Viewer/Viewer';

function App() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4 pt-8">
      {file ? <Viewer file={file} /> : <FilePicker onFileChange={setFile} />}
    </div>
  );
}

export default App;
