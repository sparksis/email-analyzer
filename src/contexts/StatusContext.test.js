import React from 'react';
import { render, act } from '@testing-library/react';
import { StatusProvider, useStatus } from './StatusContext'; // Adjust path as needed

// Test component to consume the context
const TestConsumer = () => {
  const { syncStatusMessage, setSyncStatusMessage } = useStatus();
  return (
    <div>
      <div data-testid="status-message">{syncStatusMessage}</div>
      <button onClick={() => setSyncStatusMessage('New status from test')}>Update Status</button>
    </div>
  );
};

describe('StatusContext', () => {
  test('provides initial status and updates it', () => {
    const { getByTestId, getByText } = render(
      <StatusProvider>
        <TestConsumer />
      </StatusProvider>
    );

    // Check initial state
    expect(getByTestId('status-message').textContent).toBe('Ready.');

    // Check if updater function works
    const updateButton = getByText('Update Status');
    act(() => {
      updateButton.click();
    });
    expect(getByTestId('status-message').textContent).toBe('New status from test');
  });

  test('useStatus outside of Provider throws error', () => {
    // Suppress console.error for this specific test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => render(<TestConsumer />)).toThrow('useStatus must be used within a StatusProvider');

    console.error = originalError; // Restore console.error
  });
});
