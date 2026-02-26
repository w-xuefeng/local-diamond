import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Generates a random 32-byte key represented as a 64-character hex string.
 */
export function generateMasterKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Encrypts a string using AES-256-CBC.
 */
export function encrypt(text: string, masterKeyHex: string): string {
  if (masterKeyHex.length !== 64) {
    throw new Error('Master key must be exactly 32 bytes (64 hex characters).');
  }
  const key = Buffer.from(masterKeyHex, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-CBC encrypted string.
 */
export function decrypt(encryptedText: string, masterKeyHex: string): string {
  if (masterKeyHex.length !== 64) {
    throw new Error('Master key must be exactly 32 bytes (64 hex characters).');
  }
  const key = Buffer.from(masterKeyHex, 'hex');
  const parts = encryptedText.split(':');

  const [ivHex, encryptedHex] = parts;

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted text format.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted: string = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
