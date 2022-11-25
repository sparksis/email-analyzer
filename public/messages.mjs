export const db = new Dexie('EmailDB');

db.version(1).stores({
    messages: 'id, from, sent, domain',
});

export async function findUniqueDomains() {
    const seenDomains = [];
    console.log('finding domains');
    let lastSeen;
    await db.messages.orderBy('domain').eachUniqueKey(domain => {
        if (domain !== lastSeen) {
            console.log('found a unique domain', domain);
            seenDomains.push(domain);
            lastSeen = domain;
        }
    });
    return seenDomains;
}

export default db.messages;
