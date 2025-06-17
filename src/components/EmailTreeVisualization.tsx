import React from 'react';

// Define the Message type based on the spec
interface Message {
  id: string;
  received: string;
  from: string;
  domain: string;
  to: string;
  subject: string;
}

interface EmailTreeVisualizationProps {
  emails: Message[];
}

interface SubjectMap {
  [subject: string]: number;
}

interface SenderData {
  count: number;
  subjects: SubjectMap;
}

interface SenderMap {
  [sender: string]: SenderData;
}

interface DomainData {
  count: number;
  senders: SenderMap;
}

interface TreeData {
  [domain: string]: DomainData;
}

const EmailTreeVisualization: React.FC<EmailTreeVisualizationProps> = ({ emails }) => {
  if (!emails || emails.length === 0) {
    return <p className="text-gray-500">No emails to display in tree view.</p>;
  }

  // Group emails by domain, then by sender, then by subject, and count occurrences
  const treeData = emails.reduce<TreeData>((acc, email) => {
    const { domain, from, subject } = email;

    if (!acc[domain]) {
      acc[domain] = { count: 0, senders: {} };
    }
    acc[domain].count++;

    if (!acc[domain].senders[from]) {
      acc[domain].senders[from] = { count: 0, subjects: {} };
    }
    acc[domain].senders[from].count++;

    if (!acc[domain].senders[from].subjects[subject]) {
      acc[domain].senders[from].subjects[subject] = 0;
    }
    acc[domain].senders[from].subjects[subject]++;

    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(treeData)
        .sort(([, domainDataA], [, domainDataB]) => domainDataB.count - domainDataA.count)
        .map(([domain, domainData]) => (
          <div key={domain} className="border border-purple-300 rounded-lg p-4 bg-purple-50 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.414-1.414L9 10.586l-1.121 1.121a1 1 0 101.414 1.414L9 12.414l1.121 1.121z" clipRule="evenodd" />
              </svg>
              Domain: <span className="font-normal ml-1">{domain}</span>
              <span className="text-sm font-bold bg-purple-200 text-purple-800 px-2 rounded-full ml-2">{domainData.count}</span>
            </h3>
            <ul className="pl-6 mt-2 space-y-3">
              {Object.entries(domainData.senders)
                .sort(([, senderDataA], [, senderDataB]) => senderDataB.count - senderDataA.count)
                .map(([sender, senderData]) => (
                  <li key={sender} className="border-l-2 border-purple-200 pl-4 py-1">
                    <p className="text-md font-medium text-purple-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm-6 6a3 3 0 100 6h6a3 3 0 100-6H7z" />
                      </svg>
                      Sender: <span className="font-normal ml-1">{sender}</span>
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 rounded-full ml-2">{senderData.count}</span>
                    </p>
                    <ul className="pl-6 mt-1 space-y-1">
                      {Object.entries(senderData.subjects)
                        .sort(([, subjectCountA], [, subjectCountB]) => subjectCountB - subjectCountA)
                        .map(([subject, subjectCount], idx) => (
                          <li key={`${subject}-${idx}`} className="text-sm text-gray-700 flex items-start"> {/* Improved key */}
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
};

export default EmailTreeVisualization;
