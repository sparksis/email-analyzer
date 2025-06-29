import { Dexie } from 'dexie';
import { SortedArrayMap } from 'collections/sorted-array-map'; // Assuming this path is correct from project setup

/**
 * Dexie database instance for storing email messages and related data.
 * The database is named 'EmailDB'.
 * @type {Dexie}
 * @see {@link https://dexie.org/docs/Dexie/Dexie} for Dexie.js documentation.
 */
export const db = new Dexie('EmailDB');

// Define database schema and versioning.
// Version 1 defines a 'messages' table.
// The 'messages' table is indexed by 'id' (primary key), 'to', 'domain', 'from',
// and a compound index '[to+domain+from]' for efficient querying and sorting.
db.version(1).stores({
    messages: 'id, to, domain, from, [to+domain+from]',
});

/**
 * A direct reference to the 'messages' table in the Dexie database.
 * This table stores {@link Message} like objects.
 * Use this for performing database operations (CRUD) on messages.
 * @type {Dexie.Table}
 * @see {@link https://dexie.org/docs/Table/Table} for Dexie Table API.
 */
export const messagesTable = db.messages;

/**
 * Adds or updates multiple messages in the database in a single bulk operation.
 * This function uses Dexie's `bulkPut`, which is efficient for large datasets.
 * If a message with the same primary key already exists, it will be updated.
 * Otherwise, a new message will be added.
 * @async
 * @param {Array<import('../services/gmailService.js').Message>} messages - An array of message objects to add or update.
 *   Each object should conform to the schema of the 'messages' table.
 * @returns {Promise<string[]>} A promise that resolves with an array of the primary keys of the added/updated messages.
 *                            The keys are returned for the last chunk if Dexie performs operations in chunks.
 * @throws {Error} If the bulk operation fails, Dexie may throw an error (e.g., `Dexie.BulkError`).
 */
export async function bulkAddMessages(messages) {
    return messagesTable.bulkPut(messages);
}

/**
 * Finds all unique domain names from the 'domain' field of messages stored in the database.
 * It iterates over messages ordered by domain and collects unique domain strings.
 * @async
 * @returns {Promise<Array<string>>} A promise that resolves with an array of unique domain strings.
 *                                    The array will be empty if no messages or domains are found.
 * @throws {Error} If database operations fail.
 */
export async function findUniqueDomains() {
    console.log('Finding unique domains in messageStore...');
    const uniqueDomainsSet = new Set();
    // Iterates over all messages, adding their domain to a Set to ensure uniqueness.
    await messagesTable.orderBy('domain').each(message => {
        if (message.domain && typeof message.domain === 'string') { // Ensure domain exists and is a string
            uniqueDomainsSet.add(message.domain);
        }
    });
    return Array.from(uniqueDomainsSet);
}


/**
 * Converts a nested plain JavaScript object (typically representing aggregated counts)
 * into a {@link SortedArrayMap} for ordered iteration and display.
 * The sorting of the map is based on a '_count' property within the object's values,
 * or the numerical value itself if '_count' is not present, in descending order.
 * Nested objects are recursively converted.
 * @private
 * @param {Object} object - The plain JavaScript object to convert.
 *                          Example: `{ "user1@example.com": { _count: 10, "domain.com": { _count: 5, ... } } }`
 * @returns {SortedArrayMap} A `SortedArrayMap` instance representing the ordered data.
 *                           The map's keys are derived from the input object's keys.
 *                           The map's values are objects, potentially including `key`, `count`, and `nested` (another SortedArrayMap).
 */
function toSortedMap(object) {
    // Comparator function for sorting items in the SortedArrayMap.
    // Sorts in descending order based on 'count'.
    const comparitor = function (itemA, itemB) {
        // item.value is the object like { key: "...", count: N, nested: ... }
        const valA = itemA.value.count !== undefined ? itemA.value.count : itemA.value;
        const valB = itemB.value.count !== undefined ? itemB.value.count : itemB.value;
        return (valA - valB) * -1; // Multiply by -1 for descending order
    };

    // Key equality function for SortedArrayMap
    const equate = (a, b) => a.key === b.key;

    const sortedMap = new SortedArrayMap([], equate, comparitor);

    for (let key in object) {
        if (key === '_count') continue; // Skip internal '_count' properties at the current level

        let valueForMap;
        const currentObjectLevel = object[key];
        // Check if currentObjectLevel is an object and has properties other than '_count'
        if (typeof currentObjectLevel === 'object' && currentObjectLevel !== null &&
            Object.keys(currentObjectLevel).some(k => k !== '_count')) {
            // It's a nested structure that needs further recursive conversion
            valueForMap = { key: key, count: currentObjectLevel._count, nested: toSortedMap(currentObjectLevel) };
        } else {
            // It's a simple count or a leaf node (or an object that only has _count)
            valueForMap = { key: key, count: currentObjectLevel._count || currentObjectLevel };
        }
        // The key for SortedArrayMap is implicitly managed if not provided,
        // but here we are creating items that have a 'key' property within their value.
        // The SortedArrayMap will store these items.
        sortedMap.add(valueForMap);
    }
    return sortedMap;
}


/**
 * Generates hierarchical statistics from messages stored in the database.
 * It groups messages by 'to' address, then by 'domain', and finally by 'from' address,
 * calculating counts at each level of this hierarchy.
 * The result is a {@link SortedArrayMap} which allows for ordered iteration of these statistics.
 * @async
 * @returns {Promise<SortedArrayMap>} A promise that resolves with a `SortedArrayMap`
 *                                    representing the hierarchical statistics.
 * @throws {Error} If database operations fail.
 */
export async function generateStats() {
    const TO_INDEX = 0, DOMAIN_INDEX = 1, FROM_INDEX = 2; // Indices for compound key parts
    const statsHierarchy = {}; // Temporary object to build the hierarchical stats

    // Order by the compound key [to+domain+from] to efficiently group and count.
    // Dexie's eachKey iterates over the primary keys of the items in the collection.
    // For a compound index, keyParts will be an array: [toValue, domainValue, fromValue].
    await messagesTable.orderBy('[to+domain+from]').eachKey(function (keyParts) {
        const toAddress = keyParts[TO_INDEX];
        const domain = keyParts[DOMAIN_INDEX];
        const fromAddress = keyParts[FROM_INDEX];

        // Ensure parent objects/levels in the hierarchy exist
        if (!statsHierarchy[toAddress]) {
            statsHierarchy[toAddress] = { _count: 0 };
        }
        if (!statsHierarchy[toAddress][domain]) {
            statsHierarchy[toAddress][domain] = { _count: 0 };
        }
        // Initialize the 'fromAddress' count if it's the first time seeing this specific 'from' under 'to'/'domain'
        if (statsHierarchy[toAddress][domain][fromAddress] === undefined) {
             statsHierarchy[toAddress][domain][fromAddress] = 0;
        }

        // Increment counts at all levels of the hierarchy
        statsHierarchy[toAddress]._count += 1;
        statsHierarchy[toAddress][domain]._count += 1;
        statsHierarchy[toAddress][domain][fromAddress] += 1;
    });

    return toSortedMap(statsHierarchy); // Convert the raw stats object to a SortedArrayMap
}
