# Data Model Documentation

This document describes the proposed data model for the email analyzer application. The goal is to ensure that the app remains lightweight and efficient.

## Message

The `Message` class represents an email message. It has the following properties:

- `id`: The unique identifier of the message.
- `received`: The timestamp when the message was received.
- `from`: The email address of the sender.
- `domain`: The domain of the sender's email address.
- `to`: The email address of the recipient.
- `subject`: The subject of the message.

### Headers

The `Headers` class represents the headers of an email message. It has the following properties:

- `from`: The email address of the sender.
- `to`: The email address of the recipient.
- `sent`: The timestamp when the message was sent.
- `subject`: The subject of the message.
- `delivered-to`: The email address to which the message was delivered.

### Database Schema

The database schema for storing email messages is defined using Dexie.js. The schema includes the following fields:

- `id`: The unique identifier of the message.
- `to`: The email address of the recipient.
- `domain`: The domain of the sender's email address.
- `from`: The email address of the sender.
- `[to+domain+from]`: A composite index for efficient querying.

## Data Flow

1. The user logs in and authorizes the application to access their Gmail account.
2. The application retrieves a list of email messages from the user's inbox.
3. For each message, the application fetches the message metadata and parses the headers.
4. The parsed message data is stored in the local database.
5. The application generates statistics and visualizations based on the stored messages.

## Lightweight Considerations

To ensure the application remains lightweight, the following considerations are made:

- Only essential metadata is fetched and stored for each message.
- The database schema is optimized for efficient querying and storage.
- The application uses a local database to minimize network requests and improve performance.

## Mock Data Models

### Mock Message

```json
{
  "id": "12345",
  "received": "1627849200000",
  "from": "sender@example.com",
  "domain": "example.com",
  "to": "recipient@example.com",
  "subject": "This is the subject of the message"
}
```

### Mock Headers

```json
{
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "sent": "1627849200000",
  "subject": "This is the subject of the message",
  "delivered-to": "recipient@example.com"
}
```
