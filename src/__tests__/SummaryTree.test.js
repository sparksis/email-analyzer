import { render, screen } from '@testing-library/react';
import SummaryTree from '../components/SummaryTree';

test('renders SummaryTree component', () => {
  render(<SummaryTree />);
  const summaryTreeElement = screen.getByTestId('summary-tree');
  expect(summaryTreeElement).toBeInTheDocument();
});
