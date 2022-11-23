import * as config from '../config.mjs';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

await gapi.load('client', async function () {
    await gapi.client.init({
        apiKey: config.API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
});
let tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: config.CLIENT_ID,
    scope: config.SCOPES,
    callback: '', // defined later
});

export function handleLogin() {
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 * Print all messages in the authorized user's inbox. If no messages
 * are found an appropriate message is printed.
 */
async function listMessages() {
    let response;
    try {
        response = await gapi.client.gmail.users.messages.list({
            'userId': 'me',
        });
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
    const messages = response.result.messages;
    if (!messages || messages.length == 0) {
        document.getElementById('content').innerText = 'No messages found.';
        return;
    }
    // Flatten to string to display
    const output = messages.reduce(
        (str, label) => `${str}${label.name}\n`,
        'messages:\n');
    document.getElementById('content').innerText = output;
}
