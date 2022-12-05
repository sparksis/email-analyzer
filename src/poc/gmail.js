import * as config from '../config.js';
import Message from './message.type.js';
import { default as messagesStore } from './messages.js';

const google = window.google;
const gapi = window.gapi;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';


let tokenClient = createTokenClient();

async function createTokenClient() {
    console.log('config', config, config.API_KEY);
    await gapi.load('client', async function () {
        await gapi.client.init({
            apiKey: config.API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
    });
    return google.accounts.oauth2.initTokenClient({
        client_id: config.CLIENT_ID,
        scope: config.SCOPES,
        callback: '', // defined later
    });
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
    if (!messages || messages.length === 0) {
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
    messages = messages.map(function (m) { try { return new Message(m); } catch (e) { return console.error('Invalid message', m, e); } })
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

export async function handleLogin() {
    let client = await tokenClient;
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        client.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        client.requestAccessToken({ prompt: '' });
    }

    client.callback = function () {
        loadMessagesToDb();
    }
}
