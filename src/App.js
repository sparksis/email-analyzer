import './App.css';
import { DetailView } from './components/DetailView';
import Login from './components/Login';
import SyncStatus from './components/SyncStatus';
import { fetchMessages } from './services/gmailService.js';
import { bulkAddMessages } from './stores/messageStore.js';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { StatusProvider, useStatus } from './contexts/StatusContext.js';

/**
 * `AppContent` is the main functional component of the application after contexts are set up.
 * It handles initialization of the Gmail client, manages the login process,
 * triggers message fetching, and displays core UI components.
 * It consumes `AuthContext` for authentication state/actions and `StatusContext` for status updates.
 * @returns {JSX.Element} The rendered AppContent component.
 */
function AppContent() {
  const [commitHash, setCommitHash] = useState('');
  // Consume authentication context
  const { initClient, login: authLogin } = useAuth(); // isLoggedIn is available but not directly used here yet
  // Consume status context
  const { setSyncStatusMessage } = useStatus();

  // Effect hook to fetch commit hash for display
  useEffect(() => {
    fetch('/commit-hash.txt')
      .then(response => response.text())
      .then(hash => setCommitHash(hash.trim())) // Trim any whitespace
      .catch(error => console.error('Failed to fetch commit hash:', error));
  }, []);

  // Effect hook to initialize the Gmail API client on component mount
  useEffect(() => {
    /**
     * Initializes the GAPI client using the `initClient` function from `AuthContext`.
     * Updates status context if an error occurs.
     */
    async function initializeGapiClient() {
      try {
        await initClient();
        // Success message is logged within AuthContext's initClient
      } catch (error) {
        setSyncStatusMessage(`Error initializing Gmail client: ${error.message}`);
      }
    }
    initializeGapiClient();
  }, [initClient, setSyncStatusMessage]); // Dependencies for the effect

  /**
   * Handles the login process and subsequent message fetching.
   * This function is passed to the `Login` component's `onSuccess` prop.
   * It calls the `authLogin` function from `AuthContext`. After successful
   * authentication via context, it proceeds to call `fetchMessages`.
   * @async
   */
  const handleLoginAndFetch = async () => {
    try {
      setSyncStatusMessage('Attempting login...');
      // Call login from AuthContext.
      // The callback to authLogin is executed after Google Sign-In is successful
      // and AuthContext has updated its internal state (e.g., isLoggedIn=true).
      await authLogin(async () => {
        console.log('AppContent: Authentication complete via AuthContext, now fetching messages.');
        setSyncStatusMessage('Authentication complete. Starting message fetch...');
        try {
          // `bulkAddMessages` is the callback for processing message batches.
          // `setSyncStatusMessage` is for updating status during fetching.
          await fetchMessages(bulkAddMessages, setSyncStatusMessage);
        } catch (fetchError) {
          console.error('AppContent: Error during message fetching process:', fetchError);
          setSyncStatusMessage(`Error fetching messages: ${fetchError.message || 'Unknown error during fetch'}`);
        }
      });
    } catch (error) {
      // This catch handles errors specifically from the authLogin process itself (e.g., user closes popup)
      console.error('AppContent: Login process failed:', error);
      setSyncStatusMessage(`Login failed: ${error.message || 'Unknown error during login'}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* The Login component uses AuthContext internally to manage its state (Login/Logout button)
            and calls this handleLoginAndFetch function on login button click via onSuccess prop. */}
        <Login onSuccess={handleLoginAndFetch} />
        {/* SyncStatus component consumes StatusContext to display messages */}
        <SyncStatus />
        {commitHash && <div>Commit Hash: {commitHash}</div>}
      </header>
      <DetailView />
    </div>
  );
}

/**
 * The root `App` component.
 * Its primary role is to set up the context providers (`AuthProvider`, `StatusProvider`)
 * that make authentication and status state available throughout the application.
 * It then renders `AppContent` which contains the rest of the application logic and UI.
 * @returns {JSX.Element} The App component with context providers.
 */
function App() {
  return (
    <AuthProvider>
      <StatusProvider>
        <AppContent />
      </StatusProvider>
    </AuthProvider>
  );
}

export default App;
