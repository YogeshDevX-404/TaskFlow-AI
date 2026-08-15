import crypto from 'crypto';
import { config } from '../config/env.config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = 'taskflow_integration_salt';

function getDerivedKey(): Buffer {
  const secret = config.integrationEncryptionKey || config.jwtSecret || 'taskflow-default-encryption-secret-key';
  return crypto.scryptSync(secret, SALT, 32);
}

/**
 * Encrypts a sensitive string (e.g. GitHub access token) using AES-256-GCM
 */
export function encryptToken(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty string');
  }

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string in ivHex:authTagHex:encryptedHex format
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty payload');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
