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
    <div className="App">
      <header className="App-header">
        <Login onSuccess={loadMessagesToDb} />
        <SyncStatus />
        <div>Commit Hash: {commitHash}</div>
      </header>
      <DetailView />
    </div>
  );
}

export default App;
