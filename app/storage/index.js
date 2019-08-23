import assign from 'lodash/assign';
import map from 'lodash/map';
import schemas, { STORAGE_PATH } from './schema';
import { parse, serialise } from '../libs/utils';

// eslint-disable-next-line import/no-mutable-exports
let realm = {};
let Realm = null;

class Account {
  static get data() {
    const accounts = realm.objects('Account');
    if (accounts.length > 0) return accounts[0];

    return null;
  }

  static create(data) {
    const accounts = realm.objects('Account');
    // only support single account at the beginning
    if (accounts === 1) return;
    realm.write(() => realm.create('Account', data));
  }

  static update(data) {
    realm.write(() => {
      const account = Account.data;
      assign(account, { ...data });
    });
  }

  static setLandingComplete() {
    realm.write(() => {
      const account = Account.data;
      account.landingComplete = true;
    });
  }

  static createIfNotExists() {
    const shouldCreate = Account.data == null;

    if (shouldCreate) {
      realm.write(() => {
        realm.create('Account', {
          username: '',
          address: '',
          privateKey: '',
          publicKey: '',
          landingComplete: false,
          mamRoot: '',
          sideKey: ''
        });
      });
    }
  }
}

class Contact {
  static get data() {
    const contacts = realm.objects('Contact');
    return contacts;
  }

  static getById(id) {
    return realm.objectForPrimaryKey('Contact', id);
  }

  static add(data) {
    realm.write(() => {
      realm.create('Contact', data);
    });
  }

  static delete(id) {
    const contact = Contact.getById(id);
    if (contact) {
      realm.write(() => realm.delete(contact));
    }
  }
}

class Conversation {
  static get data() {
    const conversations = realm.objects('Conversation');
    return conversations;
  }

  static get keys() {
    const conversations = realm.objects('Conversation');
    return conversations.keys;
  }

  static getById(id) {
    return realm.objectForPrimaryKey('Conversation', id);
  }

  static add(data) {
    realm.write(() => {
      realm.create('Conversation', data);
    });
  }

  static delete(id) {
    const conversation = Conversation.getById(id);
    if (conversation) {
      realm.write(() => realm.delete(conversation));
    }
  }

  static addParticipant(id, contactId) {
    const conversation = Conversation.getById(id);
    const contact = Contact.getById(contactId);
    realm.write(() => conversation.participants.push(contact));
  }

  static addMessage(id, messageData) {
    const conversation = Conversation.getById(id);
    realm.write(() => conversation.messages.push(messageData));
  }

  static getDataAsArray() {
    const conversations = Conversation.data;
    return map(conversations, conversation =>
      assign({}, conversation, {
        participants: map(conversation.participants, participant =>
          parse(serialise(participant))
        ),
        messages: map(conversation.messages, message =>
          parse(serialise(message))
        )
      })
    );
  }

  static getMessagesFromId(id) {
    const conversation = Conversation.getById(id);
    if (conversation) {
      return conversation.messages.map(message => parse(serialise(message)));
    }
    return [];
  }

  static getLastMessageFromId(id) {
    const conversation = Conversation.getById(id);
    if (conversation && conversation.messages && conversation.messages.length) {
      const { length } = conversation.messages;
      return conversation.messages[length - 1];
    }
    return null;
  }
}

const purge = () =>
  new Promise((resolve, reject) => {
    try {
      realm.removeAllListeners();
      realm.write(() => realm.deleteAll());

      Realm.deleteFile({ schema: schemas, path: STORAGE_PATH });

      resolve();
    } catch (error) {
      reject(error);
    }
  });

const initialiseStorage = getEncryptionKeyPromise => {
  // eslint-disable-next-line no-undef
  Realm = Electron.getRealm();

  return getEncryptionKeyPromise().then(encryptionKey => {
    realm = new Realm(
      assign({}, { schema: schemas, path: STORAGE_PATH }, { encryptionKey })
    );

    Account.createIfNotExists();
  });
};
const resetStorage = getEncryptionKeyPromise =>
  purge().then(() => initialiseStorage(getEncryptionKeyPromise));

export {
  Account,
  Contact,
  Conversation,
  initialiseStorage,
  realm,
  resetStorage
};
