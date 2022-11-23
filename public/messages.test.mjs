import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
import { default as messages, db, findUniqueDomains } from "./messages.mjs";


const messagesFixture = [
    { id: '1', from: '1@example.net' },
    { id: '2', from: '2@example.net' },
];

describe('storage', function () {
    beforeEach('reset the db', function () {
        return db.open();
    });
    afterEach(async function () {
        await db.close();
        await new Promise((resolve, reject) => {
            let request = window.indexedDB.deleteDatabase('EmailDB');
            request.onsuccess = resolve;
            request.onerror = reject;
        })
    });
    describe('sanity check', function () {
        it('will run', function () { });

        // Just validating the library.
        describe('db', function () {
            it('should be accessable', async function () {
                db.should.exist;
            });
            it('should be a mutable db', async function () {
                await db.messages.bulkPut(messagesFixture);
            });
        });

        describe('bulkPut', function () {
            it('should be able to store some messages', async function () {
                try {
                    await messages.bulkPut(messagesFixture);
                } catch (error) {
                    throw error;
                }
            })
        });
    });

    describe('findUniqueDomains', function () {
        const domains = ['example.net', 'example.com'];
        const emails = ['Django', 'Jeff', 'Tiana']
            .reduce((acc, name) => {
                domains.forEach(domain => acc.push(`${name}@${domain}`));
                return acc;
            }, []);
        before('Setup database', async function () {
            await db.open();
            await messages.bulkPut(emails.map((v, i) => { return { id: i, from: v } }));
        });
        after('Close Database', async function () {
            await db.close();
        });
        it(`should find ${domains.length} domains`, async function () {
            const uniqueDomains = await findUniqueDomains();
            uniqueDomains.should.include.all.members(domains);
        });
    });

});
