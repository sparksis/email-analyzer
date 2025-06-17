import { generateStats } from './messageStore'; // Adjust path
import { messagesTable } from './messageStore'; // To mock its methods
import { SortedArrayMap } from 'collections/sorted-array-map';

// Mock Dexie's Table methods
jest.mock('./messageStore', () => {
  const originalModule = jest.requireActual('./messageStore');
  return {
    ...originalModule, // Keep original db, etc. if other tests were to use them (not in this file)
    messagesTable: {
      orderBy: jest.fn().mockReturnThis(),
      eachKey: jest.fn(),
    },
  };
});

describe('messageStore', () => {
  describe('generateStats', () => {
    beforeEach(() => {
      // Reset mocks before each test
      messagesTable.orderBy.mockClear();
      messagesTable.eachKey.mockReset(); // Use mockReset to clear mock implementation too
    });

    test('correctly generates stats from a list of message keys', async () => {
      const mockKeys = [
        ['to1@example.com', 'domain1.com', 'from1@domain1.com'],
        ['to1@example.com', 'domain1.com', 'from1@domain1.com'], // Duplicate to test counts
        ['to1@example.com', 'domain2.com', 'from2@domain2.com'],
        ['to2@example.com', 'domain1.com', 'from3@domain1.com'],
      ];

      // Configure the mock for eachKey to call the callback with each key
      messagesTable.eachKey.mockImplementation(callback => {
        mockKeys.forEach(keyParts => callback(keyParts));
        return Promise.resolve(); // eachKey in Dexie is async
      });

      const stats = await generateStats();

      expect(messagesTable.orderBy).toHaveBeenCalledWith('[to+domain+from]');
      expect(stats).toBeInstanceOf(SortedArrayMap);

      // Validate structure (simplified checks)
      // These checks depend heavily on the internal structure of SortedArrayMap and toSortedMap output
      const to1Stats = stats.find(item => item.key === 'to1@example.com')?.value;
      expect(to1Stats).toBeDefined();
      expect(to1Stats.count).toBe(3);

      const to1Domain1Stats = to1Stats.nested.find(item => item.key === 'domain1.com')?.value;
      expect(to1Domain1Stats).toBeDefined();
      expect(to1Domain1Stats.count).toBe(2);

      const to1Domain1From1Stats = to1Domain1Stats.nested.find(item => item.key === 'from1@domain1.com')?.value;
      expect(to1Domain1From1Stats).toBeDefined();
      // generateStats counts individual occurrences based on the compound key [to+domain+from]
      // but the mockKeys provide this compound key. The logic in generateStats increments the final fromAddress count.
      expect(to1Domain1From1Stats.count).toBe(2);


      const to1Domain2Stats = to1Stats.nested.find(item => item.key === 'domain2.com')?.value;
      expect(to1Domain2Stats).toBeDefined();
      expect(to1Domain2Stats.count).toBe(1);
      const to1Domain2From2Stats = to1Domain2Stats.nested.find(item => item.key === 'from2@domain2.com')?.value;
      expect(to1Domain2From2Stats.count).toBe(1);


      const to2Stats = stats.find(item => item.key === 'to2@example.com')?.value;
      expect(to2Stats).toBeDefined();
      expect(to2Stats.count).toBe(1);
      const to2Domain1Stats = to2Stats.nested.find(item => item.key === 'domain1.com')?.value;
      expect(to2Domain1Stats.count).toBe(1);
      const to2Domain1From3Stats = to2Domain1Stats.nested.find(item => item.key === 'from3@domain1.com')?.value;
      expect(to2Domain1From3Stats.count).toBe(1);

    });

    test('returns an empty SortedArrayMap if no messages', async () => {
      messagesTable.eachKey.mockImplementation(callback => Promise.resolve());
      const stats = await generateStats();
      expect(stats).toBeInstanceOf(SortedArrayMap);
      expect(stats.length).toBe(0);
    });
  });

  // Tests for findUniqueDomains and bulkAddMessages would be more complex
  // without a working fake-indexeddb or more extensive Dexie mocking.
  // For now, these are omitted due to tooling limitations.
});
