import { Message } from './gmailService'; // Adjust path

describe('Message Class', () => {
  const mockGmailMessage = {
    id: '123',
    snippet: 'Test snippet',
    internalDate: '1678886400000', // Example timestamp
    payload: {
      headers: [
        { name: 'From', value: 'Sender <sender@example.com>' },
        { name: 'To', value: 'Recipient <recipient@example.com>' },
        { name: 'Subject', value: 'Test Subject' },
        { name: 'Delivered-To', value: 'deliveredto@example.com' },
      ],
    },
  };

  test('correctly constructs a Message object', () => {
    const msg = new Message(mockGmailMessage);
    expect(msg.id).toBe('123');
    expect(msg.snippet).toBe('Test snippet');
    expect(msg.recieved).toBe('1678886400000'); // Note: 'recieved' is a typo in source
    expect(msg.from).toBe('sender@example.com');
    expect(msg.domain).toBe('example.com');
    expect(msg.to).toBe('deliveredto@example.com'); // Prefers Delivered-To
    expect(msg.subject).toBe('Test Subject');
  });

  test('handles missing Delivered-To header', () => {
    const modifiedMock = {
      ...mockGmailMessage,
      payload: {
        ...mockGmailMessage.payload,
        headers: [
          { name: 'From', value: 'Sender <sender@example.com>' },
          { name: 'To', value: 'Recipient <recipient@example.com>' },
          { name: 'Subject', value: 'Test Subject' },
        ],
      },
    };
    const msg = new Message(modifiedMock);
    expect(msg.to).toBe('recipient@example.com');
  });

  test('handles various email formats for From and To', () => {
    const headers = [
      { name: 'From', value: 'justemail@domain.com' },
      { name: 'To', value: '"Quoted Name" <name.with.dots@sub.domain.com>' },
      { name: 'Subject', value: 'Test Subject' },
    ];
    const msg = new Message({ ...mockGmailMessage, payload: { headers } });
    expect(msg.from).toBe('justemail@domain.com');
    expect(msg.domain).toBe('domain.com');
    expect(msg.to).toBe('name.with.dots@sub.domain.com');
  });

  test('handles missing or undefined headers gracefully', () => {
    const msg1 = new Message({
      id: '456', snippet: '', internalDate: '0', payload: { headers: [] }
    });
    expect(msg1.from).toBe('');
    expect(msg1.domain).toBeUndefined();
    expect(msg1.to).toBe('');
    expect(msg1.subject).toBeUndefined();

    const msg2 = new Message({
      id: '789', snippet: '', internalDate: '0',
      payload: {
        headers: [
          { name: 'From', value: null }, // Test null value
        ]
      }
    });
    expect(msg2.from).toBe(''); // extractInternetAddress returns '' for falsy input
  });
});
