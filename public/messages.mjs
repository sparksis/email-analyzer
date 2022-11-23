export const db = new Dexie('EmailDB');

db.version(1).stores({
    messages: 'id, from',
});

export async function findUniqueDomains() {
    const seenDomains = [];
    console.log('finding domains');
    await db.messages.orderBy('from').eachUniqueKey(from => {
        const domain = from.substring(1 + from.lastIndexOf('@'));
        // Naive look at all domains will cause O(n^2).
        // We should investigate a projection based approach
        // with in -order insertions to ensure that we are O(n)
        if (!seenDomains.includes(domain)) {
            console.log('found a unique domain', domain);
            seenDomains.push(domain);
        }
    });
    return seenDomains;
}

export default db.messages;
