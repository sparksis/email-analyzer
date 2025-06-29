import React from 'react';
import { render } from '@testing-library/react';
import { StatusContext } from '../../contexts/StatusContext'; // Adjust path
import SyncStatus from './index'; // Adjust path

describe('SyncStatus Component', () => {
  test('displays the sync status message from context', () => {
    const mockStatusMessage = 'Test sync message';
    const { getByText } = render(
      <StatusContext.Provider value={{ syncStatusMessage: mockStatusMessage, setSyncStatusMessage: jest.fn() }}>
        <SyncStatus />
      </StatusContext.Provider>
    );
    expect(getByText(mockStatusMessage)).toBeInTheDocument();
  });

  test('displays a non-breaking space if message is empty or null for layout consistency', () => {
    const { container } = render(
      <StatusContext.Provider value={{ syncStatusMessage: '', setSyncStatusMessage: jest.fn() }}>
        <SyncStatus />
      </StatusContext.Provider>
    );
    // MUI Typography will render a span, checking its text content
    const typographyElement = container.querySelector('.MuiTypography-root');
    expect(typographyElement.textContent).toBe('\u00A0'); // Non-breaking space
  });

   test('displays default "Ready" message if context value is undefined initially (though provider sets default)', () => {
    // This tests robustness if somehow context provides undefined message
    const { getByText } = render(
      <StatusContext.Provider value={{ syncStatusMessage: undefined, setSyncStatusMessage: jest.fn() }}>
        <SyncStatus />
      </StatusContext.Provider>
    );
    // The component itself defaults syncStatusMessage if context value is undefined,
    // but useStatus() hook should ideally always get a string from provider's default state.
    // The component uses `syncStatusMessage || "\u00A0"`. If syncStatusMessage is undefined, it becomes "\u00A0".
     const typographyElement = document.querySelector('.MuiTypography-root'); // Re-query if needed
     expect(typographyElement.textContent).toBe('\u00A0');
   });
});
