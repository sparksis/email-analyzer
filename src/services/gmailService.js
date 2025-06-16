import * as config from '../config.js';

const google = window.google;
const gapi = window.gapi;

/**
 * Discovery document for the Gmail API.
 * @private
 * @type {string}
 */
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

/**
 * Stores the Google Sign-In token client.
 * @private
 * @type {google.accounts.oauth2.TokenClient | undefined}
 */
let tokenClient;

// --- Authentication Functions ---

/**
 * Creates and initializes the Google API client and the token client for OAuth2.
 * This function handles loading the 'client' library from GAPI and initializing it
 * with the API key and discovery documents. It then creates a token client
 * configured with the client ID and scopes.
 * @private
 * @returns {Promise<google.accounts.oauth2.TokenClient>} A promise that resolves to the initialized token client.
 * @throws {Error} If GAPI client initialization fails or token client creation fails.
 */
async function createTokenClient() {
    await new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: config.API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                resolve();
            } catch (e) {
                console.error('Error initializing gapi client:', e);
                reject(new Error(`GAPI client initialization failed: ${e.message}`));
            }
        });
    });
    try {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: config.CLIENT_ID,
            scope: config.SCOPES,
            callback: '', // Will be defined dynamically by the login function
        });
        if (!client) {
            throw new Error('Token client initialization returned undefined.');
        }
        return client;
    } catch (e) {
        console.error('Error initializing token client:', e);
        throw new Error(`Token client initialization failed: ${e.message}`);
    }
}

/**
 * Initializes the Google API client and token client if not already initialized.
 * This function should be called once when the application loads to prepare for
 * authentication and API calls.
 * @async
 * @throws {Error} Propagates errors from `createTokenClient` if initialization fails.
 * @returns {Promise<void>} A promise that resolves when the client is initialized.
 */
export async function initClient() {
    if (!tokenClient) {
        try {
            tokenClient = await createTokenClient();
        } catch (e) {
            console.error('Failed to initialize token client:', e);
            throw e; // Re-throw to allow caller to handle
        }
    }
}

/**
 * Initiates the Google Sign-In process. If the user is not already signed in,
 * it prompts for account selection and consent. If already signed in, it attempts
 * to get a new token silently. The provided callback is executed after successful
 * token acquisition.
 * @async
 * @param {function(): void} [callback=()=>{}] - Optional callback function to execute after successful login and token acquisition.
 * @returns {Promise<void>} A promise that resolves when the login attempt is made. Errors within callbacks are logged.
 * @throws {Error} If `initClient` fails when called as a fallback. Token acquisition errors are caught and logged.
 */
export async function login(callback = () => {}) {
  if (!tokenClient) {
    console.warn('Token client not initialized, attempting to initialize now.');
    await initClient();
  }

  const tokenResponseCallback = async (resp) => {
    if (resp.error !== undefined) {
      console.error('Error during token acquisition:', resp);
      // Not re-throwing here as it's a callback, error is logged.
      // UI should handle this based on lack of successful callback execution.
      return;
    }
    await callback();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.callback = tokenResponseCallback;
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.callback = tokenResponseCallback;
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 * Logs the user out of their Google Account for this application.
 * It revokes the current access token and clears it from the GAPI client.
 * @async
 * @returns {Promise<void>} A promise that resolves when logout is complete.
 * @throws {Error} If `google.accounts.oauth2.revoke` fails.
 */
export async function logout() {
  const currentToken = gapi.client.getToken();
  if (currentToken !== null) {
    await new Promise((resolve, reject) => {
        try {
            google.accounts.oauth2.revoke(currentToken.access_token, () => {
                gapi.client.setToken('');
                console.log('User logged out.');
                resolve();
            });
        } catch (e) {
            console.error('Error during logout:', e);
            reject(new Error(`Logout failed: ${e.message}`));
        }
    });
  }
  // tokenClient could be reset here if desired, but not strictly necessary
  // as new logins will re-initialize its callback.
}

// --- Message Parsing Utilities ---

/**
 * Extracts the email address from a string that might include a name part.
 * E.g., "Some User <user@example.com>" becomes "user@example.com".
 * Returns an empty string if the input is falsy.
 * @private
 * @param {string} address - The address string (e.g., from an email header).
 * @returns {string} The extracted email address in lowercase, or empty string.
 */
function extractInternetAddress(address) {
    if (!address) return '';
    const matches = address.match(/.*\<(.*)\>$/);
    const internetAddress = (matches && matches[1]) || address;
    return internetAddress.toLowerCase();
}

/**
 * Parses the domain from an email address.
 * E.g., "user@example.com" becomes "example.com".
 * Returns undefined if the input is falsy or parsing fails.
 * @private
 * @param {string} internetAddress - The email address (expected to be just the address part).
 * @returns {string|undefined} The domain, or undefined if parsing fails or input is invalid.
 */
function parseDomain(internetAddress) {
    if (!internetAddress) return undefined;
    try {
        const atIndex = internetAddress.lastIndexOf('@');
        if (atIndex === -1 || atIndex === internetAddress.length - 1) return undefined;
        return internetAddress.substring(atIndex + 1);
    } catch (e) {
        console.error('Failed to parse domain for', internetAddress, e);
        return undefined;
    }
}

/**
 * Represents and processes the headers of an email message.
 * It populates its own properties based on the names of the headers provided.
 * @private
 */
class Headers {
    /** The sender's email address. @type {string|undefined} */
    from;
    /** The recipient's email address. @type {string|undefined} */
    to;
    /** The date the email was sent. @type {string|undefined} */
    sent;
    /** The subject of the email. @type {string|undefined} */
    subject;
    /** The 'Delivered-To' header value. @type {string|undefined} */
    'delivered-to';

    /**
     * Constructs a Headers object by mapping an array of header objects
     * (like those from Gmail API) to its properties. Header names are lowercased.
     * @param {Array<{name: string, value: string}>} values - Array of header objects.
     */
    constructor(values) {
        values.forEach(h => {
            if (h.name)
                this[h.name.toLowerCase()] = h.value
        });
    }
}

/**
 * Represents an email message with processed header information,
 * tailored for the application's needs.
 */
export class Message {
    /** Unique ID of the message. @type {string} */
    id;
    /** A short snippet of the message content. @type {string} */
    snippet;
    /**
     * Timestamp of when the message was received (internalDate from Gmail).
     * Note: Property name has a typo, should be 'received'.
     * @type {string}
     */
    recieved;
    /** The sender's processed email address. @type {string} */
    from;
    /** The domain of the sender. @type {string|undefined} */
    domain;
    /** The recipient's processed email address (primary, from 'Delivered-To' or 'To'). @type {string} */
    to;
    /** The subject of the message. @type {string|undefined} */
    subject;

    /**
     * Constructs a Message object from a Gmail API message resource.
     * It extracts and processes relevant header information.
     * @param {object} gmailMessage - The Gmail message resource from the API.
     * @param {string} gmailMessage.id - Message ID.
     * @param {string} gmailMessage.snippet - Message snippet.
     * @param {string} gmailMessage.internalDate - Date received (timestamp string).
     * @param {{headers: Array<{name: string, value: string}>}} gmailMessage.payload - Message payload containing headers.
     */
    constructor({ id, snippet, internalDate, payload }) {
        this.id = id;
        this.snippet = snippet;
        this.recieved = internalDate;

        const headers = new Headers(payload.headers);
        this.from = extractInternetAddress(headers.from);
        this.domain = parseDomain(this.from);

        if (headers["delivered-to"]) {
            this.to = extractInternetAddress(headers["delivered-to"]);
        } else {
            this.to = extractInternetAddress(headers.to);
        }
        this.subject = headers.subject;
    }
}

// --- Message Fetching Logic ---

/**
 * Fetches messages from the user's Gmail inbox, processes them into `Message` objects,
 * and passes them to a callback for further handling (e.g., storage).
 * Handles pagination automatically and retries on rate limiting errors with exponential backoff.
 * Updates fetching status via a callback.
 * @async
 * @param {function(Array<Message>): Promise<void>} processMessagesCallback - An async callback function
 *   that receives an array of `Message` objects to process (e.g., save to a database).
 * @param {function(string): void} [setFetchStatusCallback=(statusText)=>{ console.log("Fetch Status:", statusText) }] -
 *   A callback function to update the UI or log the current fetching status.
 * @param {string} [nextPageToken] - Used internally for pagination; specifies the token for the next page of results.
 * @param {number} [retryCount=0] - Used internally to track retry attempts for error handling.
 * @returns {Promise<void>} A promise that resolves when all messages are fetched and processed, or an error occurs.
 */
export async function fetchMessages(
    processMessagesCallback,
    setFetchStatusCallback = (statusText) => { console.log("Fetch Status:", statusText); },
    nextPageToken,
    retryCount = 0
) {
    if (!gapi || !gapi.client || !gapi.client.gmail) {
        const status = 'Gmail API client not ready. Please ensure you are logged in and client is initialized.';
        console.error(status);
        setFetchStatusCallback(status);
        return;
    }

    let response;
    try {
        setFetchStatusCallback(nextPageToken ? `Fetching next page of messages... (Retry: ${retryCount})` : `Fetching messages...`);
        response = await gapi.client.gmail.users.messages.list({
            'userId': 'me',
            maxResults: 50,
            q: '-in:sent',
            pageToken: nextPageToken,
        });
    } catch (err) {
        if (err.status === 429 && retryCount < 5) { // Added max retry limit
            const backoffTime = Math.pow(2, retryCount) * 1000 + Math.random() * 1000; // Added jitter
            const status = `Rate limited. Retrying in ${Math.round(backoffTime / 1000)} seconds...`;
            console.warn(status, err);
            setFetchStatusCallback(status);
            setTimeout(() => fetchMessages(processMessagesCallback, setFetchStatusCallback, nextPageToken, retryCount + 1), backoffTime);
        } else if (err.status === 429) {
            const status = `Rate limited. Max retries reached for this page. Error: ${err.message}`;
            console.error(status, err);
            setFetchStatusCallback(status);
        }
         else {
            const status = `Error listing messages: ${err.message || JSON.stringify(err)}`;
            console.error(status, err);
            setFetchStatusCallback(status);
        }
        return;
    }

    const messageMetadatas = response.result.messages;
    if (!messageMetadatas || messageMetadatas.length === 0) {
        setFetchStatusCallback(nextPageToken ? 'No more messages found on subsequent pages.' : 'No messages found in your inbox.');
        return;
    }

    setFetchStatusCallback(`Found ${messageMetadatas.length} message metadata entries. Fetching details...`);

    let messageDetailsPromises;
    try {
      messageDetailsPromises = messageMetadatas.map(messageMetadata =>
          gapi.client.gmail.users.messages.get({
              userId: 'me',
              id: messageMetadata.id,
              format: 'metadata',
              metadataHeaders: ['Delivered-To', 'To', 'From', 'Subject']
          }).then(res => res.result)
      );
    } catch (e) {
      setFetchStatusCallback(`Error preparing requests for message details: ${e.message}`);
      console.error("Error creating message detail promises:", e);
      return;
    }


    try {
        const detailedMessages = await Promise.all(messageDetailsPromises);
        const parsedMessages = detailedMessages
            .map(m => {
                try {
                    if (!m) throw new Error("Received null/undefined message object before parsing.");
                    return new Message(m);
                } catch (e) {
                    console.error('Invalid message structure during parsing, skipping:', m, e);
                    setFetchStatusCallback(`Error parsing a message: ${e.message}. Skipping it.`);
                    return null;
                }
            })
            .filter(m => m && m.to && m.domain && m.from);

        setFetchStatusCallback(`Processing ${parsedMessages.length} fetched and parsed messages...`);
        if (parsedMessages.length > 0) {
            await processMessagesCallback(parsedMessages);
        } else {
            setFetchStatusCallback('No valid messages to process in this batch.');
        }

        const newNextPageToken = response.result.nextPageToken;
        if (newNextPageToken) {
            const status = `Batch processed. Fetching next page of messages in 30 seconds...`;
            console.log(status, '(Token:', newNextPageToken,')');
            setFetchStatusCallback(status);
            setTimeout(() => fetchMessages(processMessagesCallback, setFetchStatusCallback, newNextPageToken, 0), 30000);
        } else {
            setFetchStatusCallback('All messages fetched and processed.');
        }

    } catch (error) {
        const status = `Error processing message details batch: ${error.message || JSON.stringify(error)}`;
        console.error(status, error);
        setFetchStatusCallback(status);
    }
}
// Exported variables and functions
export { initClient, login, logout, fetchMessages, Message };
