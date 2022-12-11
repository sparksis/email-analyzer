import './App.css';
import Login from './components/Login';
import SummaryTable from './components/SummaryTable';
import SyncStatus from './components/SyncStatus';
import { loadMessagesToDb } from './gmail';

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <Login onSuccess={loadMessagesToDb} />
        <SyncStatus />
      </header>
      <SummaryTable />
    </div>
  );
}

export default App;
