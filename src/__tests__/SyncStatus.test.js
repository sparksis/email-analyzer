import { render, screen } from '@testing-library/react';
import SyncStatus from '../components/SyncStatus';

test('renders SyncStatus component', () => {
  render(<SyncStatus />);
  const syncStatusElement = screen.getByTestId('sync-status');
  expect(syncStatusElement).toBeInTheDocument();
});
