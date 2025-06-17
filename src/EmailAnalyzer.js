import React, { useState, useEffect } from 'react';
import { generateStats, getMostFrequentContactsFromDb } from './database';

// Helper function to generate a large number of mock emails
const generateMockEmails = (count) => {
  const mockData = [];
  const domains = ['example.com', 'company.com', 'gmail.com', 'outlook.com', 'corp.com', 'university.edu'];
  const subjects = [
    'Project Update', 'Meeting Reminder', 'Your Order', 'Follow Up', 'Important Notice',
    'Team Sync', 'Quick Question', 'Newsletter', 'Invoice Due', 'Welcome to our service',
    'Feedback Request', 'Upcoming Event', 'Security Alert', 'Payment Confirmation',
    'Weekly Report', 'Holiday Greetings', 'Action Required', 'New Feature Alert'
  ];
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];

  for (let i = 0; i < count; i++) {
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomFrom = `${randomName.toLowerCase()}@${randomDomain}`;
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomReceived = (1627849200000 + i * 1000 * 60 * 60 * 24).toString(); // Increment date

    mockData.push({
      id: `${i + 1}`,
      received: randomReceived,
      from: randomFrom,
      domain: randomDomain,
      to: 'me@example.com', // Hardcoded as per the issue
      subject: randomSubject + (Math.random() > 0.7 ? ` - Part ${Math.floor(Math.random() * 3) + 1}` : '')
    });
  }
  return mockData;
};

// Component to display the email tree visualization
const EmailTreeVisualization = ({ emails }) => {
  // Initial check for empty or null emails
  // Handles: null, empty array, or placeholder SortedArrayMap with empty .data
  if (!emails ||
      (Array.isArray(emails) && emails.length === 0) ||
      (!Array.isArray(emails) && emails.data && emails.data.length === 0)) {
    return <p className="text-gray-500">No emails to display in tree view.</p>;
  }

  if (Array.isArray(emails)) {
    // Existing logic for mock data (array processing)
    // Group emails by domain, then by sender, then by subject, and count occurrences
    const treeData = emails.reduce((acc, email) => {
      const { domain, from, subject } = email;

      // Initialize domain level if not present
      if (!acc[domain]) {
        acc[domain] = {
          count: 0,
          senders: {}
        };
      }
      acc[domain].count++; // Increment domain count

      // Initialize sender level if not present
      if (!acc[domain].senders[from]) {
        acc[domain].senders[from] = {
          count: 0,
          subjects: {}
        };
      }
      acc[domain].senders[from].count++; // Increment sender count

      // Initialize subject level if not present, or increment its count
      if (!acc[domain].senders[from].subjects[subject]) {
        acc[domain].senders[from].subjects[subject] = 0;
      }
      acc[domain].senders[from].subjects[subject]++; // Increment subject count

      return acc;
    }, {});

    return (
      <div className="space-y-4">
        {Object.entries(treeData)
          .sort(([, domainDataA], [, domainDataB]) => domainDataB.count - domainDataA.count) // Sort domains by count
          .map(([domain, domainData]) => (
          <div key={domain} className="border border-purple-300 rounded-lg p-4 bg-purple-50 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.414-1.414L9 10.586l-1.121 1.121a1 1 0 101.414 1.414L9 12.414l1.121 1.121z" clipRule="evenodd" />
              </svg>
              Domain: <span className="font-normal ml-1">{domain}</span> <span className="text-sm font-bold bg-purple-200 text-purple-800 px-2 rounded-full ml-2">{domainData.count}</span>
            </h3>
            <ul className="pl-6 mt-2 space-y-3">
              {Object.entries(domainData.senders)
                .sort(([, senderDataA], [, senderDataB]) => senderDataB.count - senderDataA.count) // Sort senders by count
                .map(([sender, senderData]) => (
                <li key={sender} className="border-l-2 border-purple-200 pl-4 py-1">
                  <p className="text-md font-medium text-purple-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm-6 6a3 3 0 100 6h6a3 3 0 100-6H7z" />
                    </svg>
                    Sender: <span className="font-normal ml-1">{sender}</span> <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 rounded-full ml-2">{senderData.count}</span>
                  </p>
                  <ul className="pl-6 mt-1 space-y-1">
                    {Object.entries(senderData.subjects)
                      .sort(([, subjectCountA], [, subjectCountB]) => subjectCountB - subjectCountA) // Sort subjects by count
                      .map(([subject, subjectCount], idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start"> {/* Using idx as key for subjects */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        {subject} <span className="text-xs font-semibold text-gray-500 ml-1">({subjectCount})</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  } else {
    // New logic for SortedArrayMap data from Dexie
    // `emails` is the top-level SortedArrayMap for domains.
    // The placeholder SortedArrayMap's getSortedEntries() returns: [{ name, count, children }]
    return (
      <div className="space-y-4">
        {emails.getSortedEntries().map(({ name: domain, count: domainCount, children: sendersMap }) => (
          <div key={domain} className="border border-purple-300 rounded-lg p-4 bg-purple-50 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.414-1.414L9 10.586l-1.121 1.121a1 1 0 101.414 1.414L9 12.414l1.121 1.121z" clipRule="evenodd" />
              </svg>
              Domain: <span className="font-normal ml-1">{domain}</span>
              <span className="text-sm font-bold bg-purple-200 text-purple-800 px-2 rounded-full ml-2">{domainCount}</span>
            </h3>
            <ul className="pl-6 mt-2 space-y-3">
              {sendersMap.getSortedEntries().map(({ name: sender, count: senderCount, children: subjectsMap }) => (
                <li key={sender} className="border-l-2 border-purple-200 pl-4 py-1">
                  <p className="text-md font-medium text-purple-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm-6 6a3 3 0 100 6h6a3 3 0 100-6H7z" />
                    </svg>
                    Sender: <span className="font-normal ml-1">{sender}</span>
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 rounded-full ml-2">{senderCount}</span>
                  </p>
                  <ul className="pl-6 mt-1 space-y-1">
                    {/* For subjects, `children` from `subjectsMap.getSortedEntries()` is the count itself,
                        as per how `toSortedMap` stores leaf nodes (subject counts).
                        So, the item from getSortedEntries is { name: subjectText, count: subjectCount, children: subjectCountVal }
                        We use `name` for subject text and `count` for its count.
                    */}
                    {subjectsMap.getSortedEntries().map(({ name: subject, count: subjectCount }, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start"> {/* Using idx as key for subjects */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        {subject} <span className="text-xs font-semibold text-gray-500 ml-1">({subjectCount})</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
};

// At the top level of App component or right before it
const isMockDataMode = () => {
  return sessionStorage.getItem('useMockData') === 'true';
};

// Main App component
const App = () => {
  // State to hold the email data (can be array for mock, or SortedArrayMap for DB)
  const [emails, setEmails] = useState(isMockDataMode() ? [] : null);
  const [frequentContacts, setFrequentContacts] = useState([]);
  // State to manage loading status
  const [loading, setLoading] = useState(true);
  // State to manage potential errors
  const [error, setError] = useState(null);

  // Feature flag useEffect (should already be present from previous step)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('useMockData')) {
      if (queryParams.get('useMockData') === 'true') {
        sessionStorage.setItem('useMockData', 'true');
      } else {
        sessionStorage.removeItem('useMockData');
      }
    }
    // If mode changes via URL, a page reload would typically occur, re-triggering this.
    // For more dynamic updates without reload, this effect could trigger data refetch.
  }, []);


  // Data fetching useEffect
  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isMockDataMode()) {
      console.log("Fetching mock data...");
      const mockDataArray = generateMockEmails(250);
      // Simulate network delay for mock data too for consistency
      setTimeout(() => {
        try {
          setEmails(mockDataArray); // For mock mode, emails is an array
          // Calculate frequent contacts for mock data using the component's local function
          const mockFrequentContacts = getMostFrequentContactsLocal(mockDataArray);
          setFrequentContacts(mockFrequentContacts);
          setLoading(false);
        } catch (err) {
          console.error("Error processing mock data:", err);
          setError('Failed to load mock email data.');
          setEmails([]);
          setFrequentContacts([]);
          setLoading(false);
        }
      }, 1500);
    } else {
      console.log("Fetching data from database...");
      Promise.all([generateStats(), getMostFrequentContactsFromDb()])
        .then(([treeDataFromDb, contactsFromDb]) => {
          setEmails(treeDataFromDb); // This will be a SortedArrayMap instance
          setFrequentContacts(contactsFromDb);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching data from DB:", err);
          setError('Failed to load email data from database.');
          setEmails(null); // Or an empty SortedArrayMap equivalent
          setFrequentContacts([]);
          setLoading(false);
        });
    }
    // This effect runs once on mount. Behavior upon mode change (via URL param)
    // typically involves a page reload by the user.
  }, []);

  // This local function is ONLY for mock data. Renamed to avoid confusion.
  const getMostFrequentContactsLocal = (emailList) => {
    // Guard against non-array or empty array early
    if (!Array.isArray(emailList) || emailList.length === 0) return [];
    const contactCounts = {};
    emailList.forEach(email => {
      contactCounts[email.from] = (contactCounts[email.from] || 0) + 1;
    });
    const sortedContactsArr = Object.entries(contactCounts).sort(([, countA], [, countB]) => countB - countA);
    return sortedContactsArr.slice(0, 5);
  };

  // frequentContacts state is now set within the useEffect hook.
  // The old: const frequentContacts = getMostFrequentContacts(emails); is removed.

  // Calculate total emails count for the "Emails Analyzed" card
  let totalEmailsCount = 0;
  if (!loading && !error && emails) {
    if (isMockDataMode()) {
      totalEmailsCount = emails.length;
    } else { // Dexie mode, emails is a SortedArrayMap
      if (typeof emails.getSortedEntries === 'function') {
        emails.getSortedEntries().forEach(({ count }) => { // count here is domainCount from the top level (domains)
          totalEmailsCount += count;
        });
      } else {
        console.warn("Emails object in Dexie mode does not have getSortedEntries method or is not as expected.", emails);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <header className="bg-indigo-600 text-white p-6 rounded-t-2xl">
          <h1 className="text-3xl font-bold text-center">Email Analyzer Dashboard</h1>
          <p className="text-center mt-2 text-indigo-200">Gain insights into your email habits</p>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="ml-4 text-gray-700 text-lg">Loading email data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Emails Analyzed Card */}
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

              {/* Most Frequent Contacts Card */}
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

              {/* Email Tree Visualization Component */}
              <div className="md:col-span-2 bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Email Structure (Domain &gt; Sender &gt; Subject)
                </h2>
                <div className="max-h-96 overflow-y-auto"> {/* Added scroll for long lists */}
                    <EmailTreeVisualization emails={emails} />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Section */}
        <footer className="bg-indigo-700 text-white p-4 text-center text-sm rounded-b-2xl">
          <p>&copy; 2024 Email Analyzer Project. All rights reserved. Data stored locally for your privacy.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
