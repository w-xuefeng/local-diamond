import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { encrypt, decrypt } from './crypto';

const DATA_DIR = join(homedir(), '.local-diamond');
const DATA_FILE = join(DATA_DIR, 'data.json');
const MASTER_KEY_FILE = join(homedir(), '.local-diamond-master-key');
const LANG_FILE = join(homedir(), '.local-diamond-lang');

// Ensure the directory exists
function ensureStorageDirectory(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read raw data from the filesystem
function readStorageData(): Record<string, string> {
  if (!existsSync(DATA_FILE)) {
    return {};
  }
  const content = readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

// Write raw data to the filesystem
function writeStorageData(data: Record<string, string>): void {
  ensureStorageDirectory();
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Retrieves a decrypted value by key.
 */
export function getStoredValue(key: string, masterKey: string): string | null {
  const data = readStorageData();
  const encryptedValue = data[key];
  if (!encryptedValue) {
    return null;
  }
  try {
    return decrypt(encryptedValue, masterKey);
  } catch (e) {
    console.error(`Failed to decrypt key "${key}". It may have been encrypted with a different master key.`);
    return null;
  }
}

/**
 * Stores an encrypted value by key.
 */
export function setStoredValue(key: string, value: string, masterKey: string): void {
  const data = readStorageData();
  data[key] = encrypt(value, masterKey);
  writeStorageData(data);
}

/**
 * Removes a stored value by key.
 */
export function removeStoredValue(key: string): void {
  const data = readStorageData();
  if (data[key]) {
    delete data[key];
    writeStorageData(data);
  }
}

/**
 * Lists all keys (does not return values for security).
 */
export function listStoredKeys(): string[] {
  const data = readStorageData();
  return Object.keys(data);
}

/**
 * Exports the raw encrypted storage data to a specified path.
 */
export function exportToFile(destinationPath: string): void {
  const data = readStorageData();
  writeFileSync(destinationPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Imports raw encrypted storage data from a specified path.
 * If merge is true, it combines the existing keys with imported ones (overwriting duplicates).
 * If merge is false, it completely replaces the current storage.
 */
export function importFromFile(sourcePath: string, merge: boolean = false): void {
  if (!existsSync(sourcePath)) {
    throw new Error(`File not found: ${sourcePath}`);
  }

  const content = readFileSync(sourcePath, 'utf-8');
  let importedData: Record<string, string>;
  try {
    importedData = JSON.parse(content);
  } catch (e) {
    throw new Error('Invalid JSON context in the import file.');
  }

  if (merge) {
    const currentData = readStorageData();
    const mergedData = { ...currentData, ...importedData };
    writeStorageData(mergedData);
  } else {
    writeStorageData(importedData);
  }
}

/**
 * Reads the master key from the user's home directory.
 */
export function readMasterKey(): string | null {
  if (existsSync(MASTER_KEY_FILE)) {
    try {
      const key = readFileSync(MASTER_KEY_FILE, 'utf-8').trim();
      return key.length === 64 ? key : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Writes the master key to the user's home directory.
 */
export function writeMasterKey(key: string): void {
  try {
    writeFileSync(MASTER_KEY_FILE, key, 'utf-8');
  } catch (err) {
    console.error(`Failed to write master key to ${MASTER_KEY_FILE}`, err);
  }
}

/**
 * Reads the default UI language from the user's home directory.
 */
export function readDefaultLang(): string | null {
  if (existsSync(LANG_FILE)) {
    try {
      return readFileSync(LANG_FILE, 'utf-8').trim();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Writes the default UI language to the user's home directory.
 */
export function writeDefaultLang(lang: string): void {
  try {
    writeFileSync(LANG_FILE, lang, 'utf-8');
  } catch (err) {
    console.error(`Failed to write language file to ${LANG_FILE}`, err);
  }
}
