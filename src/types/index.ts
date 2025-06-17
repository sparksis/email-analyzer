// src/types/index.ts

// Our application's Email Message structure
export interface Message {
  id: string;
  received: string; // ISO date string or timestamp string
  from: string;     // Sender's email address
  domain: string;   // Sender's email domain
  to: string;       // Recipient's email address (preferably Delivered-To)
  subject: string;
}

// Simplified types for Gmail API responses (add more fields as needed)
export interface GmailMessagePartHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailMessagePartHeader[];
  body?: { // MessagePartBody
    attachmentId?: string;
    size?: number;
    data?: string; // base64url encoded
  };
  parts?: GmailMessagePart[]; // For multipart messages
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string; // Unix timestamp ms string
  payload?: GmailMessagePart; // Contains headers, body, parts
  raw?: string; // base64url encoded raw email
  sizeEstimate?: number;
}
