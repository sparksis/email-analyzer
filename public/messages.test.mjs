import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';
import Message from './message.type.mjs';
import { default as messages, db, findUniqueDomains } from "./messages.mjs";

function createMessage(domain) {
    domain = domain || faker.internet.domainName();
    return new Message({
        id: faker.database.mongodbObjectId(),
        payload: {
            headers: [
                { name: 'From', value: faker.internet.email(null, null, domain) },
            ]
        }
    })
}

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
        const messagesFixture = [createMessage('example.org'), createMessage('example.org')];
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
                await messages.bulkPut(messagesFixture);
            })
        });
    });

    describe('findUniqueDomains', function () {
        const domains = ['example.net', 'example.com'];
        const emails = new Array(3).fill(true)
            .flatMap(() => domains.map(createMessage));
        before('Setup database', async function () {
            await db.open();
            await messages.bulkPut(emails);
        });
        after('Close Database', async function () {
            await db.close();
        });
        it(`should find ${domains.length} domains`, async function () {
            const uniqueDomains = await findUniqueDomains();
            uniqueDomains.should.include.all.members(domains);
        });
    });

    describe('high data test', async function () {
        this.timeout(0);

        const DESIRED_VOLUME = 30_000_000;
        // const DESIRED_VOLUME = 300_000_000;
        const domains = new Array(300).fill(true).map(() => faker.internet.domainName());
        before('Open database', function () {
            db.open();
        });
        before('fill the database', async function () {
            let toInsert = [];

            let timeout = Date.now() + 20_000;
            let i;
            for (i = 0; i < DESIRED_VOLUME && Date.now() < timeout; i++) {
                toInsert.push(createMessage(domains[Math.floor(Math.random() * 300)]));
                if (toInsert.length == 300) {
                    await messages.bulkPut(toInsert);
                    toInsert = [];
                    console.log('Inserted:', i);
                }
            }
            console.log(`Create ${i} messages!`);
        });
        it('should have a lot of messages', async function () {
            const count = await messages.count();
            count.should.be.above(300_000);
        });
        it(`it should have ${DESIRED_VOLUME} messages`, async function () {
            const count = await messages.count();
            count.should.be.above(DESIRED_VOLUME);
        });
        it('should have exactly 300 unique domains', async function () {
            const uniqueDomains = await findUniqueDomains();
            uniqueDomains.should.have.lengthOf(300);
        });
        after('Close DB', function () {
            db.close();
        });
    });
});
