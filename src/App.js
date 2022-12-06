import './App.css';
import Login from './components/Login';
import SummaryTable from './components/SummaryTable';
import SyncStatus from './components/SyncStatus';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Login />
        <SyncStatus />
      </header>
      <SummaryTable />
    </div>
  );
}

export default App;
