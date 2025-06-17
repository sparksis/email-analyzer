import { NextApiRequest, NextApiResponse } from 'next';

// Ensure these environment variables are set in .env.local
const API_KEY = process.env.NEXT_PUBLIC_GMAIL_API_KEY; // For gapi.client.init
const CLIENT_ID = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID; // For GIS client
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiLoaded = false;
let gisLoaded = false;

// Promise to ensure gapi is loaded
const gapiLoadPromise = new Promise<void>((resolve) => {
  if (typeof window !== 'undefined' && (window as any).gapi) {
    (window as any).gapi.load('client', () => {
      gapiLoaded = true;
      resolve();
    });
  }
});

// Promise to ensure gis is loaded
const gisLoadPromise = new Promise<void>((resolve) => {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    gisLoaded = true;
    resolve();
  } else if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    document.body.appendChild(script);
  }
});

// Initialize gapi client
async function initializeGapiClient() {
  await gapiLoadPromise;
  if (typeof window !== 'undefined' && (window as any).gapi) {
    await (window as any).gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  } else {
    throw new Error('gapi is not available');
  }
}

// Initialize GIS client
async function initializeGisClient() {
  await gisLoadPromise;
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Callback will be handled by the calling component
    });
  } else {
    throw new Error('GIS client is not available');
  }
}

// Call initialization for both
const gapiInitializationPromise = initializeGapiClient();
const gisInitializationPromise = initializeGisClient();

export interface TokenResponse extends google.accounts.oauth2.TokenResponse {
  error?: string;
}

/**
 * Prompts the user to grant access and requests an access token.
 * @param callback - Function to handle the token response.
 */
export async function requestAccessToken(callback: (response: TokenResponse) => void) {
  await gisInitializationPromise; // Ensure GIS client is initialized
  if (tokenClient) {
    tokenClient.callback = callback; // Set the callback for this specific request

    // Check if a token is already available (e.g., from a previous session)
    const currentToken = (window as any).gapi?.client?.getToken();
    if (currentToken && currentToken.access_token) {
        // If a token exists and is valid, you might want to use it directly
        // or refresh it. For simplicity, let's proceed with requesting a new one
        // or letting GIS handle session state.
        // Consider adding logic here to check token expiry.
        console.log("An existing token is available, but requesting a new one for simplicity or letting GIS handle prompt.");
    }

    tokenClient.requestAccessToken({ prompt: 'consent' }); // or 'select_account' or ''
  } else {
    callback({ error: 'Token client not initialized.' } as TokenResponse);
  }
}

/**
 * Gets the current access token from gapi.client.
 * @returns The access token object or null if not available.
 */
export function getAccessToken() {
  if (typeof window !== 'undefined' && (window as any).gapi?.client) {
    return (window as any).gapi.client.getToken();
  }
  return null;
}

/**
 * Sets the access token for gapi.client.
 * @param token - The token object to set.
 */
export function setAccessToken(token: google.accounts.oauth2.TokenResponse) {
  if (typeof window !== 'undefined' && (window as any).gapi?.client) {
    (window as any).gapi.client.setToken(token);
  }
}

/**
 * Signs the user out.
 */
export function signOut() {
  const token = getAccessToken();
  if (token && token.access_token && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    (window as any).google.accounts.oauth2.revoke(token.access_token, () => {
      console.log('Access token revoked.');
      if ((window as any).gapi?.client) {
        (window as any).gapi.client.setToken(null);
      }
    });
  }
  // Also clear any local session state if necessary
}

// Ensure GAPI client is initialized before it's used elsewhere
export const ensureGapiClientInitialized = async () => {
    await gapiInitializationPromise;
};

// Note: The actual loading of the `gapi` script itself (https://apis.google.com/js/api.js)
// is expected to be handled by a <script> tag in the main HTML document (e.g., _document.tsx or layout.tsx),
// or it can be dynamically loaded similarly to the GIS script if preferred.
// For Next.js, it's common to use `next/script` in `_app.tsx` or `layout.tsx`.

// Add a function to explicitly load gapi script if not already loaded
export const loadGapiScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).gapi) {
      resolve(); // Already loaded
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).gapi.load('client', () => {
        gapiLoaded = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error('Failed to load GAPI script.'));
    document.body.appendChild(script);
  });
};

// Combined initialization function to be called from the app
export async function initGoogleClients() {
    try {
        await loadGapiScript(); // Ensure GAPI script is loaded first
        await gisLoadPromise;   // Ensure GIS script is loaded
        await initializeGapiClient(); // Then initialize GAPI client
        await initializeGisClient();  // Then initialize GIS token client
        console.log("Google API clients initialized successfully.");
    } catch (error) {
        console.error("Error initializing Google clients:", error);
        throw error; // Re-throw to allow calling component to handle
    }
}
