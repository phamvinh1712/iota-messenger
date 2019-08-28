import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import map from 'lodash/map';
import size from 'lodash/size';
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

  static updateById(id, data) {
    const contact = Contact.getById(id);
    if (!contact) return;
    realm.write(() => {
      assign(contact, { ...data });
    });
  }
}

class Conversation {
  static get data() {
    const conversations = realm.objects('Conversation');
    return conversations;
  }

  static get keys() {
    const conversations = realm.objects('Conversation');
    if (conversations.length) return conversations.map(conversation => conversation.seed);
    return [];
  }

  static getAddress() {
    const conversations = realm.objects('Conversation');
    if (conversations.length)
      return conversations.map(conversation => ({ seed: conversation.seed, address: conversation.currentAddress }));
    return [];
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
    if (!conversation || !contact) return;
    let isExist = false;
    conversation.participants.forEach(participant => {
      if (contact.mamRoot === participant.mamRoot) {
        isExist = true;
      }
    });
    if (isExist) return;
    realm.write(() => conversation.participants.push(contact));
  }

  static addMessage(id, messageData) {
    const conversation = Conversation.getById(id);
    const { index } = messageData;
    if (conversation && index >= conversation.messages.length) {
      realm.write(() => conversation.messages.push(messageData));
    }
  }

  static getDataAsArray() {
    const conversations = Conversation.data;
    return map(conversations, conversation =>
      assign({}, conversation, {
        participants: map(conversation.participants, participant => parse(serialise(participant))),
        messages: map(conversation.messages, message => parse(serialise(message)))
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

  static updateById(id, data) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    realm.write(() => {
      assign(conversation, { ...data });
    });
  }
}

class Node {
  static getById(id) {
    return realm.objectForPrimaryKey('Node', id);
  }

  static get data() {
    return realm.objects('Node').sorted('health', true);
  }

  static getDataAsArray() {
    return map(Node.data, node => parse(serialise(node)));
  }

  static delete(url) {
    const node = Node.getById(url);

    realm.write(() => realm.delete(node));
  }

  static addNodes(nodes) {
    if (size(nodes)) {
      const existingNodes = Node.getDataAsArray();
      const existingUrls = map(existingNodes, node => node.url);

      realm.write(() => {
        each(nodes, node => {
          // If it's an existing node, just update properties.
          if (includes(existingUrls, node.url)) {
            realm.create('Node', node, 'modified');
          } else {
            realm.create('Node', node);
          }
        });

        const newNodesUrls = map(nodes, node => node.url);
        const nodesToRemove = filter(existingNodes, node => node.custom === false && !includes(newNodesUrls, node.url));

        each(nodesToRemove, node => {
          realm.delete(Node.getById(node.url));
        });
      });
    }
  }
}

class MamQueue {
  static getById(id) {
    return realm.objectForPrimaryKey('MamQueue', id);
  }

  static get data() {
    return realm.objects('MamQueue').sorted('addedTime');
  }

  static add(data) {
    realm.write(() => {
      realm.create('MamQueue', data);
    });
  }

  static getDataAsArray() {
    return map(MamQueue.data, mam => parse(serialise(mam)));
  }

  static delete(uuid) {
    const mam = MamQueue.getById(uuid);

    realm.write(() => realm.delete(mam));
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
    realm = new Realm(assign({}, { schema: schemas, path: STORAGE_PATH }, { encryptionKey }));

    Account.createIfNotExists();
  });
};
const resetStorage = getEncryptionKeyPromise => purge().then(() => initialiseStorage(getEncryptionKeyPromise));

export { MamQueue, Node, Account, Contact, Conversation, initialiseStorage, realm, resetStorage };
