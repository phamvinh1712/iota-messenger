const { ipcRenderer: ipc, clipboard, remote } = require('electron');
const keytar = require('keytar');
const fs = require('fs');
const electronSettings = require('electron-settings');
// const Kerl = require(  'iota.lib.js/lib/crypto/kerl/kerl');
// const Curl = require(  'iota.lib.js/lib/crypto/curl/curl');
// const Converter = require(  'iota.lib.js/lib/crypto/converter/converter');
const argon2 = require('argon2');
const machineUuid = require('machine-uuid-sync');
const moment = require('moment');
const { byteToTrit, byteToChar, charToByte } = require('../libs/converter');
const { removeNonAlphaNumeric } = require('../libs/utils');
const kdbxweb = require('kdbxweb');
// import Entangled from '../libs/Entangled';
const Realm = require('./Realm');
const { version } = require('../../package.json');

const capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Use a different keychain entry for development versions
const KEYTAR_SERVICE = remote.app.isPackaged
  ? 'IOTA-Messenger'
  : 'IOTA-Messenger (dev)';

kdbxweb.CryptoEngine.argon2 = (
  password,
  salt,
  memory,
  iterations,
  length,
  parallelism,
  type,
  version
) => {
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
  clipboard: content => {
    if (content) {
      const clip =
        typeof content === 'string'
          ? content
          : Array.from(content)
              .map(byte => byteToChar(byte))
              .join('');
      clipboard.writeText(clip);
      if (typeof content !== 'string') {
        global.gc();
      }
    } else {
      clipboard.clear();
    }
  },

  getPowFn: batchedPow => {
    return batchedPow ? Entangled.batchedPowFn : Entangled.powFn;
  },

  genFn: async (seed, index, security, total) => {
    if (!total || total === 1) {
      return await Entangled.genFn(seed, index, security);
    }

    const addresses = [];

    for (let i = 0; i < total; i++) {
      const address = await Entangled.genFn(seed, index + i, security);
      addresses.push(address);
    }

    return addresses;
  },

  getUserDataPath: () => {
    return remote.app.getPath('userData');
  },

  getUuid: () => machineUuid(),

  updateMenu: (attribute, value) => {
    ipc.send('menu.update', {
      attribute: attribute,
      value: value
    });
  },

  autoUpdate: () => {
    ipc.send('updates.check');
  },

  getStorage(key) {
    return electronSettings.get(key);
  },

  setStorage(key, item) {
    return electronSettings.set(key, item);
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
        key.indexOf('reduxPersist') === 0 &&
        Object.assign(data, { [key.split(':')[1]]: JSON.parse(value) })
    );
    return data;
  },

  getAllStorageKeys() {
    const data = this.getAllStorage();
    return Object.keys(data);
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

  getOS: () => {
    return process.platform;
  },

  getVersion: () => {
    return version;
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

  showMenu: () => {
    ipc.send('menu.popup');
  },

  storeUpdate: payload => {
    ipc.send('store.update', payload);
  },

  getChecksum: bytes => {
    let rawTrits = [];

    for (let i = 0; i < bytes.length; i++) {
      rawTrits = rawTrits.concat(byteToTrit(bytes[i]));
    }

    const kerl = new Kerl();
    const checksumTrits = [];
    kerl.initialize();
    kerl.absorb(rawTrits, 0, rawTrits.length);
    kerl.squeeze(checksumTrits, 0, Curl.HASH_LENGTH);

    const checksum = Converter.trytes(checksumTrits.slice(-9));

    return checksum;
  },

  garbageCollect: () => {
    global.gc();
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

  onEvent: function(event, callback) {
    let listeners = this._eventListeners[event];
    if (!listeners) {
      listeners = this._eventListeners[event] = [];
      ipc.on(event, (e, args) => {
        listeners.forEach(call => {
          call(args);
        });
      });
    }
    listeners.push(callback);
  },

  removeEvent: function(event, callback) {
    const listeners = this._eventListeners[event];
    listeners.forEach((call, index) => {
      if (call === callback) {
        listeners.splice(index, 1);
      }
    });
  },
  exportSeedToFile: async (seed, password) => {
    try {
      const credentials = new kdbxweb.Credentials(
        kdbxweb.ProtectedValue.fromString(password)
      );
      const db = kdbxweb.Kdbx.create(credentials, 'IOTA-Messenger');

      db.upgrade();

      const entry = db.createEntry(db.getDefaultGroup());
      entry.fields.Seed = kdbxweb.ProtectedValue.fromString(
        seed.map(byte => byteToChar(byte)).join('')
      );

      const content = await db.save();

      const prefix = removeNonAlphaNumeric(seed.title, 'SeedFile').trim();

      const path = await remote.dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          title: 'Export keyfile',
          defaultPath: `${prefix}-${moment().format('YYYYMMDD-HHmm')}.kdbx`,
          buttonLabel: 'Export',
          filters: [{ name: 'Seed File', extensions: ['kdbx'] }]
        }
      );

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
    const credentials = new kdbxweb.Credentials(
      kdbxweb.ProtectedValue.fromString(password)
    );

    const db = await kdbxweb.Kdbx.load(buffer, credentials);
    const entry = db.getDefaultGroup().entries[0];

    if (entry.fields.Seed)
      return entry.fields.Seed.getText()
        .split('')
        .map(char => charToByte(char.toUpperCase()))
        .filter(byte => byte > -1);
  },
  validateSeedFile: buffer => {
    const signature =
      buffer.byteLength < 8 ? null : new Uint32Array(buffer, 0, 2);

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

module.exports = Electron;
