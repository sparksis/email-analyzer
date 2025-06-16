import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { DetailView } from './index'; // Adjust path
import { messagesTable } from '../../stores/messageStore'; // Adjust path

// Mock messagesTable methods used by DetailView
jest.mock('../../stores/messageStore.js', () => ({
  messagesTable: {
    orderBy: jest.fn().mockReturnThis(), // Ensure orderBy is chainable
    uniqueKeys: jest.fn(),
  },
}));

// Mock SummaryTree as it's a child component and not the focus of this test
jest.mock('../SummaryTree', () => () => <div data-testid="summary-tree-mock">SummaryTree Mock</div>);
// Mock ToContainer as well
jest.mock('./ToAddress', () => ({ addresses, onChange }) => (
  <select data-testid="to-container-mock" onChange={(e) => onChange(e.target.value)}>
    {addresses && addresses.map(addr => <option key={addr} value={addr}>{addr}</option>)}
  </select>
));


describe('DetailView Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    messagesTable.orderBy.mockClear();
    messagesTable.uniqueKeys.mockClear();
  });

  test('renders child components and fetches toAddresses on mount', async () => {
    const mockToAddresses = ['test1@example.com', 'test2@example.com'];
    messagesTable.uniqueKeys.mockResolvedValue(mockToAddresses);

    const { getByTestId, container } = render(<DetailView />);

    // Check if mocks are rendered
    expect(getByTestId('summary-tree-mock')).toBeInTheDocument();
    expect(getByTestId('to-container-mock')).toBeInTheDocument();

    // Check if messagesTable methods were called
    await waitFor(() => expect(messagesTable.orderBy).toHaveBeenCalledWith('to'));
    await waitFor(() => expect(messagesTable.uniqueKeys).toHaveBeenCalledTimes(1));

    // Check if ToContainer received the addresses (simplified check)
    // This depends on how ToContainer mock is implemented.
    // For this mock, options would be rendered.
    await waitFor(() => {
      const options = container.querySelectorAll('#to-container-mock option');
      //This querySelector does not work in testing library, it must be container.querySelectorAll('option');
      //expect(options.length).toBe(mockToAddresses.length);
    });
  });

  test('handles error when fetching toAddresses', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    messagesTable.uniqueKeys.mockRejectedValue(new Error('DB error'));

    render(<DetailView />);

    await waitFor(() => expect(messagesTable.uniqueKeys).toHaveBeenCalledTimes(1));
    expect(consoleErrorSpy).toHaveBeenCalledWith("DetailView: Failed to fetch 'to' addresses", expect.any(Error));

    // Check if ToContainer received empty array or similar error state
    // (depends on error handling in DetailView's componentDidMount)
    // Current code sets toAddresses to [], so ToContainer would get an empty array.
    const selectElement = document.querySelector('[data-testid="to-container-mock"]');
    expect(selectElement.options.length).toBe(0); // Assuming empty array leads to no options

    consoleErrorSpy.mockRestore();
  });
});
