import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext'; // Adjust path as needed

// Mock the gmailService
jest.mock('../services/gmailService.js', () => ({
  initClient: jest.fn().mockResolvedValue(undefined),
  login: jest.fn().mockImplementation(async (callback) => {
    // Simulate successful login and then call the passed callback
    if (callback) await callback();
    return undefined;
  }),
  logout: jest.fn().mockResolvedValue(undefined),
}));

// Import the mocked service to access its mocked functions if needed for assertions
import { initClient, login as gmailLoginService, logout as gmailLogoutService } from '../services/gmailService.js';

const TestConsumer = ({ loginCallback }) => {
  const { isLoggedIn, user, login, logout, initClient: authInitClient } = useAuth();

  const handleLogin = async () => {
    await login(loginCallback); // Pass the test-specific callback here
  };

  return (
    <div>
      <div data-testid="isLoggedIn">{isLoggedIn.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button onClick={authInitClient}>Init Client</button>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  test('provides initial auth state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(getByTestId('isLoggedIn').textContent).toBe('false');
    expect(getByTestId('user').textContent).toBe('null');
  });

  test('initClient calls gmailService.initClient', async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    act(() => {
      getByText('Init Client').click();
    });
    await waitFor(() => expect(gmailInitClient).toHaveBeenCalledTimes(1));
  });

  test('login updates isLoggedIn and calls gmailService.login', async () => {
    const mockLoginProcessCallback = jest.fn();
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestConsumer loginCallback={mockLoginProcessCallback} />
      </AuthProvider>
    );

    act(() => {
      getByText('Login').click();
    });

    // Wait for login process to complete
    await waitFor(() => expect(gmailLoginService).toHaveBeenCalledTimes(1));
    // The callback to gmailLoginService (which updates context state) should have been called
    await waitFor(() => expect(getByTestId('isLoggedIn').textContent).toBe('true'));
    // The subsequent callback passed from the test (mockLoginProcessCallback) should also be called
    await waitFor(() => expect(mockLoginProcessCallback).toHaveBeenCalledTimes(1));
  });

  test('logout updates isLoggedIn and calls gmailService.logout', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // First, log in to change state
    act(() => {
      getByText('Login').click();
    });
    await waitFor(() => expect(getByTestId('isLoggedIn').textContent).toBe('true'));

    // Then, log out
    act(() => {
      getByText('Logout').click();
    });
    await waitFor(() => expect(gmailLogoutService).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getByTestId('isLoggedIn').textContent).toBe('false'));
  });

  test('useAuth outside of Provider throws error', () => {
    const originalError = console.error;
    console.error = jest.fn(); // Suppress console.error for this test
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    console.error = originalError; // Restore console.error
  });
});
