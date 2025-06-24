import { render, screen } from '@testing-library/react';
import { DetailView } from '../components/DetailView';

test('renders DetailView component', () => {
  render(<DetailView />);
  const detailViewElement = screen.getByTestId('detail-view');
  expect(detailViewElement).toBeInTheDocument();
});
