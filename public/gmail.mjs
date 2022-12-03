import * as config from '../config.mjs';
import Message from './message.type.mjs';
import { default as messagesStore } from './messages.mjs';

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

    tokenClient.callback = function () {
        loadMessagesToDb();
    }
}

/**
 * Print all messages in the authorized user's inbox. If no messages
 * are found an appropriate message is printed.
 */
async function loadMessagesToDb(nextPageToken) {
    let response;
    try {
        response = await gapi.client.gmail.users.messages.list({
            'userId': 'me',
            maxResults: 500,
            query: '-in:sent',
            pageToken: nextPageToken,
        });
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
    let messages = response.result.messages;
    if (!messages || messages.length == 0) {
        document.getElementById('content').innerText = 'No messages found.';
        return;
    }

    let responses = messages.map(message => gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['Delivered-To', 'To', 'From', 'Subject']
    }).then(response => response.result));

    messages = await Promise.all(responses);
    messages = messages.map(m => { try { return new Message(m) } catch (e) { console.error('Invalid message', m, e) } })
        .filter(m => m && m.to && m.domain && m.from);
    // console.log(...messages);

    try {
        await messagesStore.bulkPut(messages);
    } catch (e) {
        console.error(response, messages, e);
        throw e;
    }

    console.log(response.result.nextPageToken, response.result);

    setTimeout(() => loadMessagesToDb(response.result.nextPageToken), 15000);
}
