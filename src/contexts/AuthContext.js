import React, { createContext, useState, useContext, useCallback } from 'react';
import {
    initClient as gmailInitClient,
    login as gmailLoginService,
    logout as gmailLogoutService
} from '../services/gmailService.js';

/**
 * @typedef {object} UserProfile
 * @property {string} [id] - User's unique Google ID.
 * @property {string} [name] - User's full name.
 * @property {string} [email] - User's email address.
 * @property {string} [imageUrl] - URL of the user's profile picture.
 */

/**
 * @typedef {object} AuthContextType
 * @property {boolean} isLoggedIn - True if the user is currently logged in, false otherwise.
 * @property {UserProfile|null} user - Object containing user profile information if logged in, otherwise null.
 * @property {function(function(): void): Promise<void>} login - Function to initiate the login process.
 *   Takes an optional callback that is executed after successful authentication and internal state update.
 * @property {function(): Promise<void>} logout - Function to initiate the logout process.
 * @property {function(): Promise<void>} initClient - Function to initialize the Gmail API client.
 */

/**
 * React Context for authentication state and actions.
 * Provides `isLoggedIn`, `user` profile, and functions `login`, `logout`, `initClient`.
 * @type {React.Context<AuthContextType|null>}
 */
export const AuthContext = createContext(null);

/**
 * Custom hook to easily access the AuthContext.
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Provider component for the AuthContext.
 * Manages authentication state (isLoggedIn, user) and provides login, logout,
 * and client initialization functions that interact with `gmailService`.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The AuthProvider component.
 */
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null); // TODO: Actually populate user profile

    /**
     * Initializes the Gmail API client via `gmailService`.
     * Should be called once when the application mounts.
     * @async
     * @throws {Error} Propagates errors from `gmailInitClient`.
     */
    const initClient = useCallback(async () => {
        try {
            await gmailInitClient();
            console.log('AuthContext: Gmail API client initialized.');
            // Future: Check if user is already signed in and update state.
            // This would require gmailService to expose a checkStatus or similar function.
        } catch (error) {
            console.error('AuthContext: Error initializing Gmail API client:', error);
            throw error;
        }
    }, []);

    /**
     * Initiates the login process using `gmailService.login`.
     * Upon successful authentication by `gmailService`, it updates the internal
     * `isLoggedIn` state and then executes the provided `authProcessCallback`.
     * @async
     * @param {function(): void} [authProcessCallback] - Optional callback executed after successful
     *   authentication and internal state update. Typically used to trigger further actions
     *   like fetching initial data.
     * @throws {Error} Propagates errors from `gmailLoginService` or if `authProcessCallback` throws.
     */
    const login = useCallback(async (authProcessCallback) => {
        try {
            // The callback to gmailLoginService is executed after token acquisition.
            await gmailLoginService(async () => { // Made inner callback async
                setIsLoggedIn(true);
                // TODO: Fetch user profile from Gmail API if needed and set 'user' state.
                // setUser({ name: gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName() });
                console.log('AuthContext: User logged in successfully.');
                if (authProcessCallback && typeof authProcessCallback === 'function') {
                    await authProcessCallback(); // Await if the callback is async
                }
            });
        } catch (error) {
            console.error('AuthContext: Login failed', error);
            setIsLoggedIn(false);
            setUser(null);
            throw error;
        }
    }, []);

    /**
     * Initiates the logout process using `gmailService.logout`.
     * Updates `isLoggedIn` and `user` states upon successful logout.
     * @async
     * @throws {Error} Propagates errors from `gmailLogoutService`.
     */
    const logout = useCallback(async () => {
        try {
            await gmailLogoutService();
            setIsLoggedIn(false);
            setUser(null);
            console.log('AuthContext: User logged out successfully.');
        } catch (error) {
            console.error('AuthContext: Logout failed', error);
            // Even if logout service fails, update UI to reflect logged-out state.
            setIsLoggedIn(false);
            setUser(null);
            throw error;
        }
    }, []);

    /**
     * The value provided to consumers of the AuthContext.
     * @type {AuthContextType}
     */
    const value = {
        isLoggedIn,
        user,
        login,
        logout,
        initClient,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
