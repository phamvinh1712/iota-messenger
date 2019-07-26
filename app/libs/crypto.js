import { MAX_SEED_LENGTH, ALIAS_REALM } from '../constants/iota';

export const MAIN_ACCOUNT = 'IOTA-Messenger';
export const MAX_ACC_LENGTH = 250;
const ACCOUNT_PREFIX = 'account';
/*
 From A-Z and 0 there are 27 characters
  Uint8Array() creates array of value from 0-256, 243 is the closest number to 256
  that can be divided by 27. Therefore, numbers that larger than 243 must be
  skip to make the seed completely random
 */
export const generateNewSeed = async randomBytesFn => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  let seed = '';
  while (seed.length < MAX_SEED_LENGTH) {
    const byte = await randomBytesFn(1);
    if (byte[0] < 243) {
      seed += charset.charAt(byte[0] % 27);
    }
  }
  return seed;
};

export const randomiseSeedCharacter = async (seed, charId, randomBytesFn) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  let updatedSeed = '';
  let complete = false;
  while (!complete) {
    const byte = await randomBytesFn(1);
    if (byte[0] < 243) {
      updatedSeed =
        seed.substr(0, charId) +
        charset.charAt(byte[0] % 27) +
        seed.substr(charId + 1, 80);
      complete = true;
    }
  }
  return updatedSeed;
};

export const randomBytes = (size, max = 256) => {
  if (size !== parseInt(size, 10) || size < 0) {
    return false;
  }

  const rawBytes = new Uint8Array(size);

  const bytes = global.crypto.getRandomValues(rawBytes);

  for (let i = 0; i < bytes.length; i++) {
    while (bytes[i] >= 256 - (256 % max)) {
      bytes[i] = randomBytes(1, max)[0];
    }
  }

  return Array.from(bytes);
};

export const encrypt = async (contentPlain, hash) => {
  const content = new TextEncoder().encode(JSON.stringify(contentPlain));

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivHex = iv.toString();

  const algorithm = { name: 'AES-GCM', iv: iv };

  const key = await crypto.subtle.importKey('raw', hash, algorithm, false, [
    'encrypt'
  ]);

  const cipherBuffer = await crypto.subtle.encrypt(algorithm, key, content);
  const cipherArray = new Uint8Array(cipherBuffer);
  const cipherHex = cipherArray.toString();

  return `${ivHex}|${cipherHex}`;
};

export const decrypt = async (cipherText, hash) => {
  const cipherParts = cipherText.split('|');

  if (cipherParts.length !== 2 || typeof hash !== 'object') {
    throw new Error('Wrong password');
  }
  try {
    const ivArray = cipherParts[0].split(',');
    const iv = Uint8Array.from(ivArray);

    const algorithm = { name: 'AES-GCM', iv: iv };

    const key = await crypto.subtle.importKey('raw', hash, algorithm, false, [
      'decrypt'
    ]);

    const cipherArray = cipherParts[1].split(',');
    const cipher = Uint8Array.from(cipherArray);

    const plainBuffer = await crypto.subtle.decrypt(algorithm, key, cipher);

    const plainText = new TextDecoder().decode(plainBuffer);

    return JSON.parse(plainText);
  } catch (err) {
    throw new Error('Wrong password');
  }
};

export const initVault = async passwordHash => {
  try {
    const vault = await Electron.readKeychain(MAIN_ACCOUNT);
    const decryptedVault =
      vault === null ? {} : await decrypt(vault, passwordHash);

    const updatedVault = await encrypt(decryptedVault, passwordHash);

    await Electron.setKeychain(MAIN_ACCOUNT, updatedVault);

    return true;
  } catch (err) {
    throw err;
  }
};

export const initKeychain = async () => {
  await clearVault([ALIAS_REALM]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = salt.toString();
  await Electron.setKeychain(`${MAIN_ACCOUNT}-salt`, saltHex);
};

export const authorize = async key => {
  const vault = await Electron.readKeychain(MAIN_ACCOUNT);

  if (!vault) {
    throw new Error('Local storage not available');
  }
  try {
    await decrypt(vault, key);
    return true;
  } catch (err) {
    throw err;
  }
};

export const clearVault = async (keepAccounts = []) => {
  const vault = await Electron.listKeychain();
  const accounts = Object.keys(vault);

  for (let i = 0; i < accounts.length; i++) {
    if (keepAccounts.indexOf(vault[i].account) < 0) {
      await Electron.removeKeychain(vault[i].account);
    }
  }

  return true;
};

export const sha256 = async inputPlain => {
  if (typeof inputPlain !== 'string' || inputPlain.length < 1) {
    return false;
  }

  const input = new TextEncoder().encode(inputPlain);
  const hash = await crypto.subtle.digest('SHA-256', input);
  const plainHash = bufferToHex(hash);

  return plainHash;
};

export const hash = async inputPlain => {
  if (typeof inputPlain !== 'string' || inputPlain.length < 1) {
    return false;
  }

  const saltHex = await Electron.readKeychain(`${MAIN_ACCOUNT}-salt`);

  if (!saltHex) {
    throw new Error('Keychain unavailable');
  }

  const saltArray = saltHex.split(',');
  const salt = Uint8Array.from(saltArray);

  const input = new TextEncoder().encode(inputPlain);

  const hash = await Electron.argon2(input, salt);

  return hash;
};

const bufferToHex = buffer => {
  const view = new Uint8Array(buffer);
  let result = '';

  for (let i = 0; i < view.length; i++) {
    const value = view[i].toString(16);
    result += value.length === 1 ? '0' + value : value;
  }

  return result;
};

export const getRealmEncryptionKey = () => {
  return Electron.readKeychain(ALIAS_REALM).then(encryptionKey => {
    if (encryptionKey === null || encryptionKey.split(',').length !== 64) {
      const key = Uint8Array.from(randomBytes(64));

      return Electron.setKeychain(ALIAS_REALM, key.toString()).then(() => key);
    }

    return Uint8Array.from(encryptionKey.split(','));
  });
};

export const addAccount = async (username, seed, passwordHash) => {
  const usernameHash = await sha256(`${ACCOUNT_PREFIX}-${username}`);

  const vault = await encrypt(seed, passwordHash);
  await Electron.setKeychain(usernameHash, vault);

  return true;
};

export const removeAccount = async usernameHash => {
  if (usernameHash) {
    throw new Error('Account not selected');
  }

  const isRemoved = await Electron.removeKeychain(usernameHash);

  if (!isRemoved) {
    throw new Error('Incorrect seed name');
  }

  return true;
};

export const renameAccount = async (username, usernameHash, passwordHash) => {
  const newID = await sha256(`${ACCOUNT_PREFIX}-${username}`);

  const vault = await Electron.readKeychain(usernameHash);

  if (!vault) {
    throw new Error('Incorrect seed name');
  }

  await decrypt(vault, passwordHash);

  await Electron.removeKeychain(usernameHash);
  await Electron.setKeychain(newID, vault);

  return true;
};

export const updatePassword = async (hash, hashNew) => {
  const vault = await Electron.listKeychain();

  if (!vault) {
    throw new Error('Local storage not available');
  }

  const accounts = Object.keys(vault);

  if (!accounts.length) {
    return true;
  }

  for (let i = 0; i < accounts.length; i++) {
    const account = vault[i];

    if (
      account.account === `${MAIN_ACCOUNT}-salt` ||
      account.account === ALIAS_REALM
    ) {
      continue;
    }

    const decryptedVault = await decrypt(account.password, hash);
    const encryptedVault = await encrypt(decryptedVault, hashNew);

    await Electron.setKeychain(account.account, encryptedVault);
  }

  return true;
};
