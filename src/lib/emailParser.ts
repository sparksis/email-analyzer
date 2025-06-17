// src/lib/emailParser.ts
import { Message, GmailMessage, GmailMessagePartHeader } from '@/types';

/**
 * Extracts the actual email address from a string like "Display Name <email@example.com>" or just "email@example.com".
 * Converts to lowercase.
 */
function extractInternetAddress(addressWithOptionalName: string | undefined): string {
  if (!addressWithOptionalName) return '';
  const emailMatch = addressWithOptionalName.match(/<([^>]+)>/);
  if (emailMatch) {
    return emailMatch[1].toLowerCase();
  }
  return addressWithOptionalName.toLowerCase();
}

/**
 * Parses the domain from an email address.
 * e.g., "user@example.com" -> "example.com"
 */
function parseDomain(emailAddress: string): string {
  if (!emailAddress || !emailAddress.includes('@')) return '';
  try {
    return emailAddress.substring(emailAddress.lastIndexOf('@') + 1);
  } catch (e) {
    console.error('Failed to parse domain for:', emailAddress, e);
    return '';
  }
}

/**
 * Finds a specific header value from an array of headers.
 */
function getHeaderValue(headers: GmailMessagePartHeader[], name: string): string | undefined {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value;
}

/**
 * Parses a raw Gmail API Message object into our application's Message format.
 */
export function parseGmailMessage(gmailMessage: GmailMessage): Message | null {
  if (!gmailMessage || !gmailMessage.payload || !gmailMessage.payload.headers) {
    console.warn('Skipping message due to missing payload or headers:', gmailMessage.id);
    return null;
  }

  const headers = gmailMessage.payload.headers;

  const fromHeader = getHeaderValue(headers, 'From') || '';
  const fromAddress = extractInternetAddress(fromHeader);
  const domain = parseDomain(fromAddress);

  // Prioritize 'Delivered-To' for 'to' field, then 'To'
  let toAddress = extractInternetAddress(getHeaderValue(headers, 'Delivered-To'));
  if (!toAddress) {
    toAddress = extractInternetAddress(getHeaderValue(headers, 'To'));
  }

  // Fallback if 'to' is still empty (should be rare for inbox messages)
  if (!toAddress) {
    console.warn(`Message ${gmailMessage.id} has no discernable 'To' or 'Delivered-To' header.`);
    // Depending on requirements, you might use a placeholder or skip the message.
    // For now, let's use a placeholder if it's critical to have a 'to' field.
    // toAddress = 'unknown@recipient.com';
  }


  const subject = getHeaderValue(headers, 'Subject') || '(No Subject)';

  // Use internalDate for received date, convert from ms string to ISO string
  const receivedDate = gmailMessage.internalDate
    ? new Date(parseInt(gmailMessage.internalDate, 10)).toISOString()
    : new Date().toISOString(); // Fallback, though internalDate should exist

  if (!fromAddress || !domain) {
    console.warn('Skipping message due to missing From/Domain:', gmailMessage.id, { fromHeader, fromAddress, domain });
    return null; // Skip if essential From/Domain info is missing
  }

  return {
    id: gmailMessage.id,
    received: receivedDate,
    from: fromAddress,
    domain: domain,
    to: toAddress || 'unknown@recipient.com', // Ensure 'to' is always a string
    subject: subject,
  };
}
