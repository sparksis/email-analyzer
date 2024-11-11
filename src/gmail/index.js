import tokenClient from "./token-client";

import Message from "../poc/message.type"
import messageStore from "../poc/messages"

const gapi = window.gapi;
let loginResolver;
export const authContext = new Promise(resolve => {
    loginResolver = resolve;
});

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
    client.callback = loginResolver;
    return authContext;
}

// TODO: remove this code (originally copied from POC)
/**
 * Print all messages in the authorized user's inbox. If no messages
 * are found an appropriate message is printed.
 */
export async function loadMessagesToDb(nextPageToken, retryCount = 0) {
    let response;
    try {
        response = await gapi.client.gmail.users.messages.list({
            'userId': 'me',
            maxResults: 500,
            q: '-in:sent in:inbox',
            pageToken: nextPageToken,
        });
    } catch (err) {
        if (err.status === 429) {
            const backoffTime = Math.pow(2, retryCount) * 1000;
            console.log(`Received 429 error. Retrying in ${backoffTime / 1000} seconds...`);
            setTimeout(() => loadMessagesToDb(nextPageToken, retryCount + 1), backoffTime);
        } else {
            document.getElementById('content').innerText = err.message;
        }
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
        await messageStore.bulkPut(messages);
    } catch (e) {
        console.error(response, messages, e);
        throw e;
    }

    console.log(response.result.nextPageToken, response.result);

    setTimeout(() => loadMessagesToDb(response.result.nextPageToken), 30000);
}
