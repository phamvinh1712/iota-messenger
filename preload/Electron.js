import { ipcRenderer as ipc, clipboard, remote } from 'electron';
import keytar from 'keytar';
import fs from 'fs';
import electronSettings from 'electron-settings';
import Kerl from 'iota.lib.js/lib/crypto/kerl/kerl';
import Curl from 'iota.lib.js/lib/crypto/curl/curl';
import Converter from 'iota.lib.js/lib/crypto/converter/converter';
import argon2 from 'argon2';
import machineUuid from 'machine-uuid-sync';
import { byteToTrit, byteToChar } from 'libs/iota/converter';
import { removeNonAlphaNumeric } from 'libs/utils';
import { moment } from 'libs/exports';

import Entangled from '../libs/Entangled';
import ledger from '../hardware/Ledger';
import Realm from '../libs/Realm';
import { version } from '../../package.json';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};


let onboardingSeed = null;
let onboardingGenerated = false;

// Use a different keychain entry for development versions
const KEYTAR_SERVICE = remote.app.isPackaged ? 'Trinity wallet' : 'Trinity wallet (dev)';

/**
 * Global Electron helper for native support
 */
const Electron = {
  /**
   * Set clipboard value, in case of Seed array, trigger Garbage Collector
   * @param {string|array} Content - Target content
   * @returns {undefined}
   */
  clipboard: (content) => {
    if (content) {
      const clip =
        typeof content === 'string'
          ? content
          : Array.from(content)
            .map((byte) => byteToChar(byte))
            .join('');
      clipboard.writeText(clip);
      if (typeof content !== 'string') {
        global.gc();
      }
    } else {
      clipboard.clear();
    }
  },

  /**
   * Do Proof of Work
   * @param {boolean} batchedPow - Should return batched PoW function
   * @returns {function} Proof of Work
   */
  getPowFn: (batchedPow) => {
    return batchedPow ? Entangled.batchedPowFn : Entangled.powFn;
  },

  /**
   * Generate address
   * @param {array} seed - Input seed
   * @param {number} index - Address index
   * @param {number} security - Address generation security level
   * @param {total} total - Amount of addresses to generate
   * @returns {string} Generated address
   */
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

  /**
   * Returns per-user application data directory
   * @returns {string} - Full app data path
   */
  getUserDataPath: () => {
    return remote.app.getPath('userData');
  },

  /**
   * Gets machine UUID
   * @return {string}
   */
  getUuid: () => machineUuid(),

  /**
   * Proxy native menu attribute settings
   * @param {string} Attribute - Target attribute
   * @param {any} Value - Target attribute value
   * @returns {undefined}
   */
  updateMenu: (attribute, value) => {
    ipc.send('menu.update', {
      attribute: attribute,
      value: value,
    });
  },

  /**
   * Trigger auto update
   * @returns {undefined}
   */
  autoUpdate: () => {
    ipc.send('updates.check');
  },

  /**
   * Set Tray icon
   * @param {boolean} enabled - Is the tray app enabled
   * @returns {undefined}
   */
  setTray: (enabled) => {
    ipc.send('tray.enable', enabled);
  },

  /**
   * Proxy deep link value to main process
   * @returns {undefined}
   */
  requestDeepLink: () => {
    ipc.send('request.deepLink');
  },

  /**
   * Get local storage item by item key
   * @param {string} Key - Target item key
   * @returns {any} Storage item value
   */
  getStorage(key) {
    return electronSettings.get(key);
  },

  /**
   * Set local storage item by item key
   * @param {string} Key - Target item key
   * @param {any} Storage - Target item value
   * @returns {boolean} If item update is succesfull
   */
  setStorage(key, item) {
    return electronSettings.set(key, item);
  },

  /**
   * Remove local storage item by item key
   * @param {string} Key - Target item key
   * @returns {boolean} If item removal is succesfull
   */
  removeStorage(key) {
    return electronSettings.delete(key);
  },

  /**
   * Remove all local storage items
   * @returns {undefined}
   */
  clearStorage() {
    const keys = electronSettings.getAll();
    Object.keys(keys).forEach((key) => this.removeStorage(key));
  },

  /**
   * Get all local storage items
   * @returns {object} Storage items
   */
  getAllStorage() {
    const storage = electronSettings.getAll();
    const data = {};

    Object.entries(storage).forEach(
      ([key, value]) =>
        key.indexOf('reduxPersist') === 0 && Object.assign(data, { [key.split(':')[1]]: JSON.parse(value) }),
    );
    return data;
  },

  /**
   * Get all local storage item keys
   * @returns {array} Storage item keys
   */
  getAllStorageKeys() {
    const data = this.getAllStorage();
    return Object.keys(data);
  },

  /**
   * Get all keychain account entries
   * @returns {promise} Promise resolves in an Array of entries
   */
  listKeychain: () => {
    return keytar.findCredentials(KEYTAR_SERVICE);
  },

  /**
   * Get keychain account entry by account name
   * @param accountName - Target account name
   * @returns {promise} Promise resolves in account object
   */
  readKeychain: (accountName) => {
    return keytar.getPassword(KEYTAR_SERVICE, accountName);
  },

  /**
   * Set keychain account entry by account name
   * @param accountName - Target account name
   * @param content - Target account content
   * @returns {promise} Promise resolves in success boolean
   */
  setKeychain: (accountName, content) => {
    return keytar.setPassword(KEYTAR_SERVICE, accountName, content);
  },

  /**
   * Remove keychain account by account name
   * @param accountName - Target account name
   * @returns {promise} Promise resolves in a success boolean
   */
  removeKeychain: (accountName) => {
    return keytar.deletePassword(KEYTAR_SERVICE, accountName);
  },

  /**
   * Hash input using argon2
   * @param {Uint8Array} input - Input data
   * @param {Uint8Array} salt - Salt used for hashing
   * @returns {Uint8Array} Raw Argon2 hash
   */
  argon2: (input, salt) => {
    return argon2.hash(input, {
      raw: true,
      salt: Buffer.from(salt),
    });
  },

  /**
   * Get currrent operating system
   * @returns {string} Operating system code - win32|linux|darwin
   */
  getOS: () => {
    return process.platform;
  },

  /**
   * Get currrent release number
   * @returns {string}
   */
  getVersion: () => {
    return version;
  },

  /**
   * Minimize Wallet window
   * @returns {undefined}
   */
  minimize: () => {
    remote.getCurrentWindow().minimize();
  },

  /**
   * Toggle Wallet window maximize state
   * @returns {undefined}
   */
  maximize: () => {
    const window = remote.getCurrentWindow();
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  },

  /**
   * Reload Wallet window to initial location
   * @returns {undefined}
   */
  reload: () => {
    remote.getCurrentWindow().webContents.goToIndex(0);
  },

  /**
   * Focus main wallet window
   * @param {string} view - optional view to navigate to
   */
  focus: (view) => {
    ipc.send('window.focus', view);
  },

  /**
   * Close current wallet windoow
   * @returns {undefined}
   */
  close: () => {
    remote.getCurrentWindow().close();
  },

  /**
   * Trigger native menu visibility on Windows platforms
   * @returns {undefined}
   */
  showMenu: () => {
    ipc.send('menu.popup');
  },

  /**
   * Proxy store updates to Tray application
   * @param {string} payload - Store state
   * @returns {undefined}
   */
  storeUpdate: (payload) => {
    ipc.send('store.update', payload);
  },

  /**
   * Set onboarding seed variable to bypass Redux
   * @param {array} Seed - Target seed byte array
   * @param {boolean} isGenerated - Is the seed generated using Trinity
   * @returns {undefined}
   */
  setOnboardingSeed: (seed, isGenerated) => {
    onboardingSeed = seed;
    onboardingGenerated = isGenerated ? true : false;
  },

  /**
   * Get onboarding seed value
   * @returns {array} Onboarding seed value
   */
  getOnboardingSeed: () => {
    return onboardingSeed;
  },

  /**
   * Get onboarding seed generated in Trinity state
   * @returns {boolean} Is seed generated
   */
  getOnboardingGenerated: () => {
    return onboardingGenerated;
  },

  /**
   * Calculate seed checksum
   * @param {array} bytes - Target seed byte array
   * @returns {string | array} Seed checksum
   */
  getChecksum: (bytes) => {
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

  /**
   * Trigger Garbage Collector
   * @returns {undefined}
   */
  garbageCollect: () => {
    global.gc();
  },

  /**
   * Show a native dialog box
   * @param {string} message - Dialog box content
   * @param {string} buttonTitle - dialog box button title
   * @param {string} title - Dialog box title, is not shown on all platforms
   * @returns {number} Returns 0 after dialog button press
   */
  dialog: async (message, buttonTitle, title) => {
    return await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
      type: 'info',
      title,
      message,
      buttons: [buttonTitle],
    });
  },

  /**
   * Send a IPC message to current window
   * @param {string} type - Message type
   * @param {any} payload - Message payload
   */
  send: (type, payload) => {
    remote.getCurrentWindow().webContents.send(type, payload);
  },


  /**
   * Create and show a native notification based on new transactions
   * @param {string} accountName - target account name
   * @param {array} transactions - new transactions
   * @param {array} confirmations - recently confirmed transactions
   * @param {object} settings - wallet settings
   */
  notify: (accountName, transactions, confirmations, settings) => {
    if (!transactions.length && !confirmations.length) {
      return;
    }

    if (!settings.notifications || !settings.notifications.general) {
      return;
    }

    let message = '';

    if (transactions.length > 1) {
      message = locales.multipleTx;
    } else if (transactions.length && transactions[0].transferValue === 0) {
      if (!settings.notifications.messages) {
        return;
      }
      message = locales.messageTx;
    } else if (transactions.length) {
      message = locales.valueTx.replace('{{value}}', formatIotas(transactions[0].transferValue));
    } else if (settings.notifications.confirmations) {
      message = confirmations[0].incoming ? locales.confirmedIn : locales.confirmedOut;
      message = message.replace('{{value}}', formatIotas(confirmations[0].transferValue));
    }

    const notification = new Notification('Trinity', {
      body: message.replace('{{account}}', accountName),
    });

    notification.onclick = () => {
      remote.getCurrentWindow().webContents.send('account.switch', accountName);
    };
  },

  /**
   * Return Realm instance
   * @returns {Object} - Realm instance
   */
  getRealm: () => {
    return Realm;
  },

  /**
   * Add native window wallet event listener
   * @param {string} event - Target event name
   * @param {function} callback - Event trigger callback
   * @returns {undefined}
   */
  onEvent: function(event, callback) {
    let listeners = this._eventListeners[event];
    if (!listeners) {
      listeners = this._eventListeners[event] = [];
      ipc.on(event, (e, args) => {
        listeners.forEach((call) => {
          call(args);
        });
      });
    }
    listeners.push(callback);
  },

  /**
   * Remove native window wallet event listener
   * @param {string} event - Target event name
   * @param {function} callback - Event trigger callback
   * @returns {undefined}
   */
  removeEvent: function(event, callback) {
    const listeners = this._eventListeners[event];
    listeners.forEach((call, index) => {
      if (call === callback) {
        listeners.splice(index, 1);
      }
    });
  },

  _eventListeners: {},

  ledger,
};

export default Electron;