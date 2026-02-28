import { fetchMessages } from '../fetchMessages';
import messageStore from '../../poc/messages';
import Message from '../../poc/message.type';

jest.mock('../../poc/messages', () => ({
  bulkPut: jest.fn(),
}));

const gapi = {
  client: {
    gmail: {
      users: {
        messages: {
          list: jest.fn(),
          get: jest.fn(),
        },
      },
    },
  },
};

window.gapi = gapi;

describe('fetchMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and store messages', async () => {
    const messages = [
      { id: '1', snippet: 'snippet1', internalDate: 'date1', payload: { headers: [] } },
      { id: '2', snippet: 'snippet2', internalDate: 'date2', payload: { headers: [] } },
    ];

    gapi.client.gmail.users.messages.list.mockResolvedValue({
      result: { messages },
    });

    gapi.client.gmail.users.messages.get.mockResolvedValue({
      result: messages[0],
    });

    await fetchMessages();

    expect(gapi.client.gmail.users.messages.list).toHaveBeenCalled();
    expect(gapi.client.gmail.users.messages.get).toHaveBeenCalledTimes(2);
    expect(messageStore.bulkPut).toHaveBeenCalledWith(
      messages.map((m) => new Message(m))
    );
  });

  it('should handle 429 error and retry', async () => {
    const messages = [
      { id: '1', snippet: 'snippet1', internalDate: 'date1', payload: { headers: [] } },
    ];

    gapi.client.gmail.users.messages.list
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce({
        result: { messages },
      });

    gapi.client.gmail.users.messages.get.mockResolvedValue({
      result: messages[0],
    });

    await fetchMessages();

    expect(gapi.client.gmail.users.messages.list).toHaveBeenCalledTimes(2);
    expect(gapi.client.gmail.users.messages.get).toHaveBeenCalledTimes(1);
    expect(messageStore.bulkPut).toHaveBeenCalledWith(
      messages.map((m) => new Message(m))
    );
  });
});
