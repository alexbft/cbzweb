import { Suspense, useState } from 'react';
import './App.css';
import { FilePicker } from './components/FilePicker/FilePicker';
import { Viewer } from './components/Viewer/Viewer';

function App() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pt-8">
        <FilePicker onFileChange={setFile} />
        {file &&
          <Suspense fallback={<div>Loading...</div>}>
            <Viewer file={file} />
          </Suspense>
        }
      </div>
    </>
  )
}

export default App
