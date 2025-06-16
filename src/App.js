import './App.css';
import { DetailView } from './components/DetailView';
import Login from './components/Login';
import SyncStatus from './components/SyncStatus';
import { loadMessagesToDb } from './gmail';
import { useEffect, useState } from 'react';

function App() {
  const [commitHash, setCommitHash] = useState('');

  useEffect(() => {
    fetch('/commit-hash.txt')
      .then(response => response.text())
      .then(hash => setCommitHash(hash));
  }, []);

  return (
    <div className="App bg-[#f0f0f0] text-[#333] dark:bg-[#252725] dark:text-white">
      <header className="min-h-[3em] py-[1em] pr-[1em] pl-[2em] bg-[#e0e0e0] dark:bg-[#3e4237]">
        <Login onSuccess={loadMessagesToDb} />
        <SyncStatus />
        <div>Commit Hash: {commitHash}</div>
      </header>
      <DetailView />
    </div>
  );
}

export default App;
