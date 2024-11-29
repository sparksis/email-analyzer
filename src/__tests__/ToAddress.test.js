import { render, screen } from '@testing-library/react';
import ToContainer from '../components/DetailView/ToAddress';

test('renders ToContainer component', () => {
  render(<ToContainer addresses={['test@example.com']} onChange={() => {}} />);
  const toContainerElement = screen.getByTestId('to-container');
  expect(toContainerElement).toBeInTheDocument();
});
