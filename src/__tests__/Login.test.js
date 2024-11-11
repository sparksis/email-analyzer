import { render, screen } from '@testing-library/react';
import Login from '../components/Login';

test('renders Login component', () => {
  render(<Login />);
  const loginElement = screen.getByTestId('login-button');
  expect(loginElement).toBeInTheDocument();
});
