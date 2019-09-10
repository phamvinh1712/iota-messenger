import assign from 'lodash/assign';
import each from 'lodash/each';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import map from 'lodash/map';
import size from 'lodash/size';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
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

  static getDataAsArray() {
    return map(Contact.data, contact => parse(serialise(contact)));
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
      return conversations.map(conversation => ({ seed: conversation.seed, address: conversation.nextAddress }));
    return [];
  }

  static getChannelAddress() {
    const conversations = realm.objects('Conversation');
    if (conversations.length) {
      const addresses = [];
      conversations.forEach(conversation => {
        conversation.channels.forEach(channel => {
          addresses.push({ seed: conversation.seed, address: channel.nextAddress });
        });
      });
    }
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

  static addChannel(id, channelData) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    let isExist = false;
    conversation.channels.forEach(channel => {
      if (channel.mamRoot === channelData.mamRoot) {
        isExist = true;
      }
    });
    if (isExist) return;
    realm.write(() => conversation.channels.push(channelData));
  }

  static addMessage(id, channelId, messageData) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    let channel = null;
    conversation.channels.forEach(c => {
      if (c.mamRoot === channelId) {
        channel = c;
      }
    });
    const { index } = messageData;
    if (channel && index >= channel.messages.length) {
      realm.write(() => channel.messages.push(messageData));
    }
  }

  static updateConversationAddress(id, address) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    realm.write(() => {
      conversation.nextAddress = address;
    });
  }

  static updateChannelAddress(id, channelId, address) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    let channel = null;
    conversation.channels.forEach(c => {
      if (c.mamRoot === channelId) {
        channel = c;
      }
    });
    if (channel)
      realm.write(() => {
        channel.nextAddress = address;
      });
  }

  static getSelfChannelFromId(id) {
    const conversation = Conversation.getById(id);
    if (!conversation) return;
    let channel = null;
    conversation.channels.forEach(c => {
      if (c.self) {
        channel = c;
      }
    });
    return channel;
  }

  static getDataAsArray() {
    const conversations = Conversation.data;
    return map(conversations, conversation =>
      assign({}, conversation, {
        channels: map(conversation.channels, channel => parse(serialise(channel)))
      })
    );
  }

  static getMessagesFromId(id) {
    const conversation = Conversation.getById(id);
    if (conversation) {
      const messages = [];
      conversation.channels.forEach(channel => {
        channel.messages.forEach(message => {
          messages.push({ content: message.content, createdTime: message.createdTime, sender: channel.owner });
        });
      });
      return orderBy(messages, ['createdTime'], ['asc']);
    }
    return [];
  }

  static getConversationName(id) {
    const conversation = Conversation.getById(id);
    if (conversation) {
      return conversation.channels.map(channel => channel.owner.username).join(',');
    }
    return '';
  }

  static getLastMessageFromId(id) {
    const messages = Conversation.getLastMessageFromId(id);
    if (messages.length) {
      const { length } = messages;
      return messages[length - 1];
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

  static getParticipantFromConversation(id, participantRoot) {
    const conversation = Conversation.getById(id);
    if (!conversation || !conversation.channels.length) return;
    const contact = find(conversation.channels.filter(channel => !channel.self), ['owner.mamRoot', participantRoot]);
    if (contact) return contact;
    return null;
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

export { Node, Account, Contact, Conversation, initialiseStorage, realm, resetStorage };
