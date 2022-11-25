// import { Address } from 'https://unpkg.com/address-rfc2822@2.1.0/index.js'

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
        this.from = headers.from;
        this.domain = this.parseDomain();
        this.to = headers.to;
        this.subject = headers.subject;
    }

    parseDomain() {
        try {
            const matches = this.from.match(/.*\<(.*)\>$/);
            const emailAddress = matches && matches[1] || this.from;
            return emailAddress.substring(emailAddress.lastIndexOf('@') + 1);
        } catch (e) {
            return console.error('failed to parse domain for', this.from, e);
        }
    }
}
