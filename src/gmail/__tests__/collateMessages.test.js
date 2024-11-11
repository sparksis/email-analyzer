import { collateMessages } from '../collateMessages';
import messageStore from '../../poc/messages';

jest.mock('../../poc/messages', () => ({
  db: {
    messages: {
      orderBy: jest.fn().mockReturnThis(),
      eachKey: jest.fn(),
    },
  },
}));

describe('collateMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should collate messages correctly', async () => {
    const messages = [
      ['to1', 'domain1', 'from1'],
      ['to1', 'domain1', 'from2'],
      ['to1', 'domain2', 'from1'],
      ['to2', 'domain1', 'from1'],
    ];

    messageStore.db.messages.eachKey.mockImplementation((callback) => {
      messages.forEach(callback);
    });

    const result = await collateMessages();

    expect(result).toEqual(
      new Map([
        [
          { key: 'to1', count: 3 },
          new Map([
            [
              { key: 'domain1', count: 2 },
              new Map([
                [{ key: 'from1', count: 1 }, 1],
                [{ key: 'from2', count: 1 }, 1],
              ]),
            ],
            [{ key: 'domain2', count: 1 }, new Map([[{ key: 'from1', count: 1 }, 1]])],
          ]),
        ],
        [
          { key: 'to2', count: 1 },
          new Map([[{ key: 'domain1', count: 1 }, new Map([[{ key: 'from1', count: 1 }, 1]])]]),
        ],
      ])
    );
  });
});
