import { Dexie } from 'dexie';
import { SortedArrayMap } from 'collections/sorted-array-map';
export const db = new Dexie('EmailDB');

db.version(1).stores({
    messages: 'id, to, domain, from, [to+domain+from]',
});

const Messages = db.messages;
export default Messages;

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

function toSortedMap(object) {
    const comparitor = function (l, r) {
        const lValue = l.count || l;
        const rValue = r.count || r;
        return (lValue - rValue) * -1;
    }
    const r = new SortedArrayMap([], (l, r) => l.key === r.key, comparitor);
    for (let key in object) {
        if (key === '_count') continue;
        r.add(toSortedMap(object[key]), { key, count: object[key]._count||object[key] });
    }
    return r;
}

export async function generateStats() {
    const TO = 0, DOMAIN = 1, FROM = 2;
    const stats = {};
    const lastSeen = new Array(3);

    await db.messages.orderBy('[to+domain+from]').eachKey(function (key) {
        // console.log(...key);
        if (key[TO] !== lastSeen[TO]) {
            lastSeen[TO] = key[TO];
            stats[key[TO]] = { _count: 0 };
        }
        if (key[DOMAIN] !== lastSeen[DOMAIN]) {
            lastSeen[DOMAIN] = key[DOMAIN];
            stats[key[TO]][key[DOMAIN]] = { _count: 0 };
        }
        if (key[FROM] !== lastSeen[FROM]) {
            lastSeen[FROM] = key[FROM];
            stats[key[TO]][key[DOMAIN]][key[FROM]] = 0;
        }
        stats[key[TO]]._count += 1;
        stats[key[TO]][key[DOMAIN]]._count += 1;
        stats[key[TO]][key[DOMAIN]][key[FROM]] += 1;
    });
    return toSortedMap(stats);
}

