import tokenClient from "./token-client";

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
