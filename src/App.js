import './App.css';
import { DetailView } from './components/DetailView';
import Login from './components/Login';
import SyncStatus from './components/SyncStatus';
import { loadMessagesToDb } from './gmail';

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <Login onSuccess={loadMessagesToDb} />
        <SyncStatus />
      </header>
      <DetailView />
    </div>
  );
}

export default App;
