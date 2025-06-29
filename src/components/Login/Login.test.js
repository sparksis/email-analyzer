import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path
import Login from './index'; // Adjust path

describe('Login Component', () => {
  const mockOnSuccess = jest.fn();
  const mockLogout = jest.fn().mockResolvedValue(undefined);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Login button when not logged in', () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: false, login: jest.fn(), logout: mockLogout, initClient: jest.fn() }}>
        <Login onSuccess={mockOnSuccess} />
      </AuthContext.Provider>
    );
    expect(getByText('Login')).toBeInTheDocument();
  });

  test('calls onSuccess prop when Login button is clicked', () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: false, login: jest.fn(), logout: mockLogout, initClient: jest.fn() }}>
        <Login onSuccess={mockOnSuccess} />
      </AuthContext.Provider>
    );
    fireEvent.click(getByText('Login'));
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  test('renders Logout button when logged in', () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: true, login: jest.fn(), logout: mockLogout, initClient: jest.fn() }}>
        <Login onSuccess={mockOnSuccess} />
      </AuthContext.Provider>
    );
    expect(getByText('Logout')).toBeInTheDocument();
  });

  test('calls authContext logout when Logout button is clicked', async () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: true, login: jest.fn(), logout: mockLogout, initClient: jest.fn() }}>
        <Login onSuccess={mockOnSuccess} />
      </AuthContext.Provider>
    );

    // Using `act` because the logout function is async and might update state
    await act(async () => {
      fireEvent.click(getByText('Logout'));
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('does not call onSuccess if not provided and login clicked', () => {
    // Test that it doesn't crash if onSuccess is not provided
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: false, login: jest.fn(), logout: mockLogout, initClient: jest.fn() }}>
        <Login onSuccess={undefined} />
      </AuthContext.Provider>
    );
    expect(() => fireEvent.click(getByText('Login'))).not.toThrow();
    // mockOnSuccess should not have been called as it's not passed
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
