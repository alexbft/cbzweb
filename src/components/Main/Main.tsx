import { useState } from 'react';
import { FilePicker } from '../FilePicker/FilePicker';
import { Viewer } from '../Viewer/Viewer';
import { setDefaultTitle } from '../../helpers/setTitle';

export function Main() {
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
