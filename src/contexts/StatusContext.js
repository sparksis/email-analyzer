import React, { createContext, useState, useContext, useCallback } from 'react';

/**
 * @typedef {object} StatusContextType
 * @property {string} syncStatusMessage - The current synchronization or general status message.
 * @property {function(string): void} setSyncStatusMessage - Function to update the `syncStatusMessage`.
 */

/**
 * React Context for application-wide status messages.
 * Provides `syncStatusMessage` and a function `setSyncStatusMessage` to update it.
 * @type {React.Context<StatusContextType|null>}
 */
export const StatusContext = createContext(null);

/**
 * Custom hook to easily access the StatusContext.
 * @returns {StatusContextType} The status context value.
 * @throws {Error} If used outside of a StatusProvider.
 */
export const useStatus = () => {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error('useStatus must be used within a StatusProvider');
    }
    return context;
};

/**
 * Provider component for the StatusContext.
 * Manages `syncStatusMessage` state and provides the message and its updater function
 * to consuming components.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The StatusProvider component.
 */
export const StatusProvider = ({ children }) => {
    const [syncStatusMessage, setSyncStatusMessageState] = useState('Ready.'); // Initial status

    /**
     * Updates the synchronization status message.
     * Wrapped in useCallback for performance if passed down to memoized children.
     * @param {string} message - The new status message.
     */
    const updateSyncStatus = useCallback((message) => {
        console.log('StatusContext Update:', message); // Log for debugging
        setSyncStatusMessageState(message);
    }, []); // No dependencies, setSyncStatusMessageState is stable

    /**
     * The value provided to consumers of the StatusContext.
     * @type {StatusContextType}
     */
    const value = {
        syncStatusMessage,
        setSyncStatusMessage: updateSyncStatus,
    };

    return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
};
