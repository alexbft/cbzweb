import { useState } from 'react';
import './App.css';
import { FilePicker } from './components/FilePicker/FilePicker';

function App() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pt-8">
        <FilePicker onFileChange={setFile} />
        {file && <img src={URL.createObjectURL(file)} alt="Preview" />}
      </div>
    </>
  )
}

export default App
