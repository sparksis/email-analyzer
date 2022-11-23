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
        this.to = headers.to;
        this.subject = headers.subject;
    }
}
