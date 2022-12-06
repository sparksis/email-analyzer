import * as config from '../config.js';

const google = window.google;
const gapi = window.gapi;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';



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

export default createTokenClient();
