import { ipcRenderer as ipc, remote } from 'electron';
import keytar from 'keytar';
import fs from 'fs';
import electronSettings from 'electron-settings';
import argon2 from 'argon2';
import moment from 'moment';
import kdbxweb from 'kdbxweb';
import { byteToChar, charToByte } from '../libs/converter';
import { removeNonAlphaNumeric } from '../libs/utils';
import Entangled from '../libs/Entangled';
import Realm from './Realm';

// Use a different keychain entry for development versions
const KEYTAR_SERVICE = remote.app.isPackaged ? 'IOTA-Messenger' : 'IOTA-Messenger (dev)';

kdbxweb.CryptoEngine.argon2 = (password, salt, memory, iterations, length, parallelism, type, version) => {
  return argon2.hash(password, {
    hashLength: length,
    timeCost: iterations,
    memoryCost: memory,
    parallelism,
    type,
    version,
    salt: Buffer.from(salt),
    raw: true
  });
};

const Electron = {
  getPowFn: batchedPow => {
    return batchedPow ? Entangled.batchedPowFn : Entangled.powFn;
  },

  getUserDataPath: () => {
    console.log(remote.app.getPath('userData'));
    return remote.app.getPath('userData');
  },

  removeStorage(key) {
    return electronSettings.delete(key);
  },

  clearStorage() {
    const keys = electronSettings.getAll();
    Object.keys(keys).forEach(key => this.removeStorage(key));
  },

  getAllStorage() {
    const storage = electronSettings.getAll();
    const data = {};

    Object.entries(storage).forEach(
      ([key, value]) =>
        key.indexOf('reduxPersist') === 0 && Object.assign(data, { [key.split(':')[1]]: JSON.parse(value) })
    );
    return data;
  },

  listKeychain: () => {
    return keytar.findCredentials(KEYTAR_SERVICE);
  },

  readKeychain: accountName => {
    return keytar.getPassword(KEYTAR_SERVICE, accountName);
  },

  setKeychain: (accountName, content) => {
    return keytar.setPassword(KEYTAR_SERVICE, accountName, content);
  },

  removeKeychain: accountName => {
    return keytar.deletePassword(KEYTAR_SERVICE, accountName);
  },

  argon2: (input, salt) => {
    return argon2.hash(input, {
      raw: true,
      salt: Buffer.from(salt)
    });
  },

  minimize: () => {
    remote.getCurrentWindow().minimize();
  },

  maximize: () => {
    const window = remote.getCurrentWindow();
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  },

  reload: () => {
    remote.getCurrentWindow().webContents.goToIndex(0);
  },

  focus: view => {
    ipc.send('window.focus', view);
  },

  close: () => {
    remote.getCurrentWindow().close();
  },

  dialog: async (message, buttonTitle, title) => {
    return await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'info',
      title,
      message,
      buttons: [buttonTitle]
    });
  },

  send: (type, payload) => {
    remote.getCurrentWindow().webContents.send(type, payload);
  },

  getRealm: () => {
    return Realm;
  },

  exportSeedToFile: async (seed, password) => {
    try {
      const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));
      const db = kdbxweb.Kdbx.create(credentials, 'IOTA-Messenger');

      db.upgrade();

      const entry = db.createEntry(db.getDefaultGroup());
      entry.fields.Seed = kdbxweb.ProtectedValue.fromString(seed.map(byte => byteToChar(byte)).join(''));

      const content = await db.save();

      const prefix = removeNonAlphaNumeric(seed.title, 'SeedFile').trim();

      const path = await remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: 'Export keyfile',
        defaultPath: `${prefix}-${moment().format('YYYYMMDD-HHmm')}.kdbx`,
        buttonLabel: 'Export',
        filters: [{ name: 'Seed File', extensions: ['kdbx'] }]
      });

      if (!path) {
        throw Error('Export cancelled');
      }

      fs.writeFileSync(path, Buffer.from(content));

      return false;
    } catch (error) {
      return error.message;
    }
  },
  importSeedFromFile: async (buffer, password) => {
    const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(password));

    const db = await kdbxweb.Kdbx.load(buffer, credentials);
    const entry = db.getDefaultGroup().entries[0];

    if (entry.fields.Seed)
      return entry.fields.Seed.getText()
        .split('')
        .map(char => charToByte(char.toUpperCase()))
        .filter(byte => byte > -1);
  },
  validateSeedFile: buffer => {
    const signature = buffer.byteLength < 8 ? null : new Uint32Array(buffer, 0, 2);

    if (!signature || signature[0] !== kdbxweb.Consts.Signatures.FileMagic) {
      return false;
    }
    if (signature[1] === kdbxweb.Consts.Signatures.Sig2Kdb) {
      return false;
    }
    if (signature[1] !== kdbxweb.Consts.Signatures.Sig2Kdbx) {
      return false;
    }
    return true;
  },

  _eventListeners: {}
};

export default Electron;
