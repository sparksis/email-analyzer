function extractInternetAddress(address) {
    // eslint-disable-next-line
    const matches = address.match(/.*\<(.*)\>$/);
    const internetAddress = (matches && matches[1]) || address;
    return internetAddress.toLowerCase();
}
function parseDomain(internetAddress) {
    try {
        return internetAddress.substring(internetAddress.lastIndexOf('@') + 1);
    } catch (e) {
        return console.error('failed to parse domain for', this.from, e);
    }
}

class Headers {
    from;
    to;
    sent;
    subject;
    'delivered-to';
    constructor(values) {
        values.forEach(h => {
            if (h.name)
                this[h.name.toLowerCase()] = h.value
        });
    }
}

export default class Message {
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
