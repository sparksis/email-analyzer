import { Dexie } from 'dexie';
// Assuming SortedArrayMap will be provided or defined elsewhere,
// for now, let's create a placeholder if it's not a standard library.
// If 'collections/sorted-array-map' is a project-local path, adjust as necessary.
// For this step, we'll assume SortedArrayMap is available.
// import { SortedArrayMap } from 'collections/sorted-array-map'; // This might cause issues if not resolvable

// Placeholder for SortedArrayMap if not available via npm 'collections'
class SortedArrayMap {
  constructor(initialData = [], comparer, sortComparer) {
    this.data = initialData;
    this.comparer = comparer || ((l, r) => l.key === r.key);
    this.sortComparer = sortComparer; // Comparer for sorting, e.g., (a, b) => b.count - a.count
    if (this.sortComparer) {
      this.data.sort(this.sortComparer);
    }
  }
  add(value, keyObject) {
    // Simplified add for placeholder
    this.data.push({ key: keyObject, value: value });
    if (this.sortComparer) {
      this.data.sort(this.sortComparer);
    }
  }
  // Implement other necessary methods like .map(), .forEach() or allow direct access to .data for iteration
  // For EmailTreeVisualization, it might iterate over .data which would be an array of {key, value} objects
  // where 'key' contains the item's properties (e.g., name and count) and 'value' is the nested SortedArrayMap or final count.

  // Example: Allow iteration like Object.entries for compatibility
  entries() {
    return this.data.map(item => [item.key.key, item.value]); // Assuming keyObject has a 'key' prop for the name and 'value' for children
  }
  // A more direct way to iterate if adapting EmailTreeVisualization
  getSortedEntries() {
      return this.data.map(item => ({ name: item.key.key, count: item.key.count, children: item.value }));
  }
}


export const db = new Dexie('EmailDB');

db.version(2).stores({ // Version incremented to 2
    messages: 'id, to, domain, from, subject, [to+domain+from], [domain+from+subject]',
});

export const Messages = db.messages;

// Assuming SortedArrayMap placeholder is defined as in previous step.
// The keyObject for .add should be like { key: 'name', count: value } for sorting.

export function toSortedMap(obj) {
  // Comparator for sorting entries by count (descending)
  const countComparator = (a, b) => {
    // a and b are like: { key: { key: 'name', count: 123 }, value: ... }
    return b.key.count - a.key.count;
  };

  const recurse = (currentObject, level) => {
    // Pass the sortComparator to the constructor
    const map = new SortedArrayMap([], (l, r) => l.key.key === r.key.key, countComparator);

    for (const key in currentObject) {
      if (key === '_count') continue;

      const value = currentObject[key];
      let keyForMap = key; // e.g., domain name, sender email, or subject text
      let countForKey = 0;
      let nestedObject;

      if (level === 'domains') {
        countForKey = value._count;
        nestedObject = value.senders;
        map.add(recurse(nestedObject, 'senders'), { key: keyForMap, count: countForKey });
      } else if (level === 'senders') {
        countForKey = value._count;
        nestedObject = value.subjects;
        map.add(recurse(nestedObject, 'subjects'), { key: keyForMap, count: countForKey });
      } else if (level === 'subjects') { // Leaf nodes: subjects
        countForKey = value; // Here, value is directly the count
        // For leaf nodes, the 'value' in SortedArrayMap can be the count itself or null
        map.add(countForKey, { key: keyForMap, count: countForKey });
      }
    }
    return map;
  };

  return recurse(obj, 'domains');
}

export async function generateStats() {
  const stats = {};

  await db.messages.orderBy('[domain+from+subject]').each(msg => {
    const { domain, from, subject } = msg;

    // Domain level
    if (!stats[domain]) {
      stats[domain] = { _count: 0, senders: {} };
    }
    stats[domain]._count++;

    // Sender level
    if (!stats[domain].senders[from]) {
      stats[domain].senders[from] = { _count: 0, subjects: {} };
    }
    stats[domain].senders[from]._count++;

    // Subject level
    if (!stats[domain].senders[from].subjects[subject]) {
      stats[domain].senders[from].subjects[subject] = 0;
    }
    stats[domain].senders[from].subjects[subject]++;
  });

  return toSortedMap(stats);
}

export async function getMostFrequentContactsFromDb() {
  const contactCounts = {};

  await db.messages.each(message => {
    contactCounts[message.from] = (contactCounts[message.from] || 0) + 1;
  });

  const sortedContacts = Object.entries(contactCounts)
    .sort(([, countA], [, countB]) => countB - countA);

  return sortedContacts.slice(0, 5);
}

export default Messages; // Default export is Messages table

// Add some sample data to Dexie for testing if it's empty
(async () => {
  const count = await db.messages.count();
  if (count === 0) {
    console.log("Adding sample data to Dexie EmailDB...");
    await db.messages.bulkAdd([
      { id: '1', to: 'me@example.com', domain: 'example.com', from: 'alice@example.com', subject: 'Hello World', received: Date.now().toString() },
      { id: '2', to: 'me@example.com', domain: 'example.com', from: 'bob@example.com', subject: 'Meeting Update', received: (Date.now() - 100000).toString() },
      { id: '3', to: 'me@example.com', domain: 'company.com', from: 'charlie@company.com', subject: 'Project Plan', received: (Date.now() - 200000).toString() },
      { id: '4', to: 'me@example.com', domain: 'example.com', from: 'alice@example.com', subject: 'Re: Hello World', received: (Date.now() - 50000).toString() },
      { id: '5', to: 'other@example.com', domain: 'gmail.com', from: 'dave@gmail.com', subject: 'Quick Question', received: (Date.now() - 150000).toString() },
      { id: '6', to: 'me@example.com', domain: 'example.com', from: 'alice@example.com', subject: 'Hello World', received: (Date.now() - 250000).toString() }, // Duplicate subject for alice
    ]);
    console.log("Sample data added.");
  }
})();
