"use client"; // This is a client component

import React, { useState, useEffect, useCallback } from 'react';
import EmailTreeVisualization from '@/components/EmailTreeVisualization'; // Assuming components are in src/components
import {
  initGoogleClients,
  requestAccessToken,
  getAccessToken,
  setAccessToken,
  signOut as gmailSignOut,
  TokenResponse
} from '@/lib/gmailAuth'; // Assuming lib is in src/lib

// Define the Message interface (can be moved to a types file later)
interface Message {
  id: string;
  received: string; // Timestamp string
  from: string; // Sender's email address
  domain: string; // Sender's email domain
  to: string; // Recipient's email address
  subject: string; // Email subject line
}

// Helper to generate mock emails for initial UI rendering without GAPI
// This is temporary and will be replaced by actual GAPI calls.
const generateMockEmails = (count: number): Message[] => {
  const mockData: Message[] = [];
  const domains = ['example.com', 'company.com', 'gmail.com', 'outlook.com'];
  const subjects = ['Project Update', 'Meeting Reminder', 'Follow Up', 'Important Notice'];
  const names = ['Alice', 'Bob', 'Charlie', 'Diana'];

  for (let i = 0; i < count; i++) {
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomFrom = `${randomName.toLowerCase()}@${randomDomain}`;
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    mockData.push({
      id: `${i + 1}`,
      received: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
      from: randomFrom,
      domain: randomDomain,
      to: 'me@example.com',
      subject: randomSubject,
    });
  }
  return mockData;
};


export default function EmailAnalyzerPage() {
  const [emails, setEmails] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // const [userName, setUserName] = useState<string | null>(null); // Optional: for user display

  // Initialize Google API clients
  useEffect(() => {
    const initializeClients = async () => {
      try {
        await initGoogleClients();
        console.log("Google clients initialized on page load.");
        // Check if user is already signed in (e.g. has a token)
        const token = getAccessToken();
        if (token && token.access_token) {
          console.log("User has existing token.");
          setIsAuthenticated(true);
          // TODO: Optionally, immediately fetch emails if token is valid
          // For now, we'll require a manual "fetch" or do it upon login success
        } else {
           console.log("No existing token found.");
        }
      } catch (err) {
        console.error("Failed to initialize Google clients:", err);
        setError("Failed to initialize Google services. Please try again later.");
      } finally {
        // Initial loading is for client initialization, not email fetching yet
        // setLoading(false); // We might set loading true again for login/data fetch
      }
    };
    initializeClients();
  }, []);

  // Separate useEffect for initial data load (mock for now)
  useEffect(() => {
    setLoading(true);
    // Simulating data load with mock data for now
    const mockEmails = generateMockEmails(50); // Reduced for quicker initial load
    setTimeout(() => {
      setEmails(mockEmails);
      setLoading(false);
    }, 1000); // Simulate delay
  }, []); // Runs once after initial render

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await requestAccessToken((response: TokenResponse) => {
        if (response.error) {
          setError(`Login failed: ${response.error}`);
          setIsAuthenticated(false);
          setLoading(false);
        } else if (response.access_token) {
          setAccessToken(response);
          setIsAuthenticated(true);
          console.log("Login successful, token obtained.");
          // TODO: Fetch user profile (optional)
          // TODO: Trigger email fetching logic here
          // For now, just log success and stop loading
          setLoading(false);
          setError("Login successful! Implement email fetching next."); // Placeholder message
        } else {
          // Handle cases where there's no error but no token (e.g., user closed popup)
          console.log("Login attempt completed without error or token.");
          setLoading(false);
          // setError("Login cancelled or failed to complete.");
        }
      });
    } catch (err: any) {
      setError(`Login error: ${err.message || 'Unknown error'}`);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    gmailSignOut();
    setIsAuthenticated(false);
    setEmails([]); // Clear emails on logout
    // setUserName(null);
    console.log("User signed out.");
  }, []);

  // Function to calculate most frequent contacts (from example)
  const getMostFrequentContacts = (emailList: Message[]): Array<[string, number]> => {
    if (!emailList || emailList.length === 0) return [];
    const contactCounts: { [contact: string]: number } = {};
    emailList.forEach(email => {
      contactCounts[email.from] = (contactCounts[email.from] || 0) + 1;
    });
    const sortedContacts = Object.entries(contactCounts).sort(([, countA], [, countB]) => countB - countA);
    return sortedContacts.slice(0, 5);
  };

  const frequentContacts = getMostFrequentContacts(emails);
  const totalEmailsCount = emails.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <header className="bg-indigo-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Email Analyzer Dashboard</h1>
            <p className="mt-2 text-indigo-200">Gain insights into your email habits</p>
          </div>
          <div>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading} // Disable button while loading clients or during login attempt
              >
                {loading && !emails.length ? 'Initializing...' : 'Login with Gmail'}
              </button>
            )}
          </div>
        </header>

        <main className="p-8">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="ml-4 text-gray-700 text-lg">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!loading && !error && !isAuthenticated && (
             <div className="text-center p-8">
                <p className="text-xl text-gray-700">Please login with your Gmail account to analyze your emails.</p>
             </div>
          )}

          {!loading && !error && isAuthenticated && emails.length === 0 && (
            <div className="text-center p-8">
                <p className="text-xl text-gray-700">No emails fetched yet, or no emails found. Try fetching your emails.</p>
                {/* TODO: Add a button to trigger email fetch if not automatic post-login */}
            </div>
          )}


          {!loading && !error && isAuthenticated && emails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m0 0h18" />
                  </svg>
                  Emails Analyzed
                </h2>
                <p className="text-5xl font-bold text-blue-900">{totalEmailsCount}</p>
                <p className="text-gray-600 mt-2">Total number of email metadata processed.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H7a1 1 0 00-1 1v2H4a2 2 0 00-2 2v11a2 2 0 002 2h2m10-2v2m-6 0h6m-12 0h6m-6 0V7.914a1 1 0 01.293-.707l2.121-2.121A1 1 0 0110 5h4a1 1 0 01.707.293l2.121 2.121A1 1 0 0117 7.914V20" />
                  </svg>
                  Most Frequent Contacts
                </h2>
                {frequentContacts.length > 0 ? (
                  <ul className="space-y-3">
                    {frequentContacts.map(([contact, count]) => (
                      <li key={contact} className="flex items-center text-gray-700">
                        <span className="bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">{count}</span>
                        {contact}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No contacts found.</p>
                )}
              </div>

              <div className="md:col-span-2 bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Email Structure (Domain &gt; Sender &gt; Subject)
                </h2>
                <div className="max-h-96 overflow-y-auto">
                  <EmailTreeVisualization emails={emails} />
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="bg-indigo-700 text-white p-4 text-center text-sm rounded-b-2xl">
          <p>&copy; {new Date().getFullYear()} Email Analyzer Project. All rights reserved. Data processed locally.</p>
        </footer>
      </div>
    </div>
  );
}
