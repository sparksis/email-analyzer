import React from 'react';
import { render, waitFor } from '@testing-library/react';
import SummaryTree from './index'; // Adjust path
import { generateStats } from '../../stores/messageStore'; // Adjust path
import { SortedArrayMap } from 'collections/sorted-array-map';

// Mock messageStore.generateStats
jest.mock('../../stores/messageStore.js', () => ({
  generateStats: jest.fn(),
}));

describe('SummaryTree Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    generateStats.mockReset();
  });

  test('renders "Loading statistics..." initially and calls generateStats', async () => {
    generateStats.mockResolvedValue(new SortedArrayMap()); // Mock an empty result initially

    const { getByText } = render(<SummaryTree />);

    expect(getByText('Loading statistics...')).toBeInTheDocument();
    await waitFor(() => expect(generateStats).toHaveBeenCalledTimes(1));
  });

  test('renders data once generateStats resolves', async () => {
    // Create a mock SortedArrayMap structure similar to what generateStats would produce
    // This is simplified; real data would be more complex.
    const mockStatsData = new SortedArrayMap();
    const toLevel = new SortedArrayMap();
    const domainLevel = new SortedArrayMap();
    domainLevel.add({ key: 'test.com', count: 1 });
    toLevel.add({ key: 'user@example.com', count: 1, nested: domainLevel });
    mockStatsData.add(toLevel.get(0).value); // toSortedMap stores the {key, count, nested} as value

    generateStats.mockResolvedValue(mockStatsData);

    const { queryByText, findByText } = render(<SummaryTree />);

    // Wait for the component to re-render with data
    await findByText(/user@example.com/); // Check if part of the key is rendered
    expect(queryByText('Loading statistics...')).toBeNull(); // Loading message should disappear
    expect(getByText(/user@example.com/)).toBeInTheDocument();
    expect(getByText(/test.com/)).toBeInTheDocument();
  });

  test('handles generateStats failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    generateStats.mockRejectedValue(new Error('Failed to fetch stats'));

    const { getByText, queryByText } = render(<SummaryTree />);

    await waitFor(() => expect(generateStats).toHaveBeenCalledTimes(1));
    // It should still render, perhaps with an error message or just empty
    // Based on current code, it will render "Loading statistics..." because tree remains null
    expect(getByText('Loading statistics...')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith("SummaryTree: Failed to load stats", expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
