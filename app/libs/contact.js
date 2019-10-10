import { Mam as MAM } from '@iota/client-load-balancer';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import trimEnd from 'lodash/trimEnd';
import { sendTransfer } from './iota';
import { Account, Contact, Conversation } from '../storage';
import { decryptRSA, encryptRSA, getSeed, signRSA } from './crypto';
import { getMamRoot, updateMamChannel, createChannel } from './mam';
import { fetchNewChannelFromConversation } from './conversation';

export const fetchContactInfo = async (iotaSettings, mamRoot) => {
  const contact = Contact.getById(mamRoot);
  if (contact) return contact;

  try {
    MAM.init(iotaSettings);
    const result = await MAM.fetch(mamRoot, 'private');
    if (result && result.messages && result.messages.length) {
      const contact = JSON.parse(trytesToAscii(result.messages[result.messages.length - 1]));

      if (!contact || !contact.username || !contact.publicKey || !contact.address) {
        throw new Error('Invalid contact');
      }
      Contact.add({
        username: contact.username,
        publicKey: contact.publicKey,
        address: contact.address,
        mamRoot
      });
      return Contact.getById(mamRoot);
    }
    return null;
  } catch (e) {
    throw new Error(e);
  }
};

export const sendConversationRequest = async (iotaSettings, passwordHash, mamRoot, join = true) => {
  const contactInfo = await fetchContactInfo(iotaSettings, mamRoot);
  if (contactInfo && contactInfo.username && contactInfo.publicKey && contactInfo.address) {
    try {
      const conversation = createChannel(iotaSettings);
      Conversation.add({ ...conversation, tempName: contactInfo.username });

      const requestMessage = {};
      Object.keys(conversation).forEach(key => {
        if (key !== 'currentAddress') {
          requestMessage[key] = encryptRSA(conversation[key], contactInfo.publicKey);
        }
      });

      const seed = await getSeed(passwordHash, 'string');

      requestMessage.senderRoot = encryptRSA(getMamRoot(iotaSettings, seed, 1), contactInfo.publicKey);

      const transfer = [
        {
          address: contactInfo.address,
          value: 0,
          message: asciiToTrytes(JSON.stringify(requestMessage))
        }
      ];

      await sendTransfer(iotaSettings, seed, transfer);
      if (join) {
        await joinConversation(iotaSettings, seed, conversation.seed);
        await fetchNewChannelFromConversation(iotaSettings, conversation.seed);
      }
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
    return true;
  }
  return false;
};

export const joinConversation = async (iotaSettings, seed, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  const selfChannel = createChannel(iotaSettings);
  Conversation.addChannel(conversation.seed, { ...selfChannel, self: true });
  const { sideKey, mamRoot, privateKey } = Account.data;

  const selfPayload = {
    mamRoot: selfChannel.mamRoot,
    sideKey: selfChannel.sideKey,
    ownerRoot: mamRoot,
    signature: signRSA(selfChannel.mamRoot, privateKey)
  };
  Conversation.addChannel(conversation.seed, { ...selfChannel, self: true });
  const conversationInfo = {
    conversationSeed: conversation.seed,
    conversationSideKey: conversation.sideKey,
    channelSeed: selfChannel.seed,
    channelSideKey: selfChannel.sideKey
  };
  await Promise.all([
    updateMamChannel(iotaSettings, selfPayload, conversation.seed, 'restricted', conversation.sideKey),
    updateMamChannel(iotaSettings, conversationInfo, seed, 'restricted', sideKey, 0, 2)
  ]);
};

export const decryptContactRequest = async (iotaSettings, messageData, privateKey) => {
  if (messageData.senderRoot && messageData.sideKey && messageData.mamRoot && messageData.seed) {
    const decryptedData = {};

    Object.keys(messageData).forEach(key => {
      decryptedData[key] = decryptRSA(messageData[key], privateKey);
    });
    try {
      const sender = await fetchContactInfo(iotaSettings, decryptedData.senderRoot);
      decryptedData.sender = sender;
      if (!sender) return null;
    } catch (e) {
      console.log(e);
      return null;
    }
    return decryptedData;
  }
  return null;
};

export const getContactRequest = async (iotaSettings, seed) => {
  const { privateKey } = Account.data;
  const conversations = [];
  const transactions = Account.data.transactions.filter(
    transaction => transaction.address === Account.data.address.substring(0, 81)
  );
  const bundles = groupBy(transactions, 'bundle');

  await Promise.all(
    Object.keys(bundles).map(async key => {
      const message = sortBy(bundles[key], ['currentIndex'])
        .map(transaction => transaction.signatureMessageFragment)
        .join('');

      const trimmedMessage = trimEnd(message, '9');

      try {
        const messageData = JSON.parse(trytesToAscii(trimmedMessage));
        const decryptedData = await decryptContactRequest(iotaSettings, messageData, privateKey);
        if (decryptedData) conversations.push(decryptedData);
      } catch (e) {
        console.log(e);
      }
    })
  );

  await Promise.all(
    conversations.map(async conversation => {
      const checkContact = Contact.getById(conversation.senderRoot);
      if (!checkContact) {
        Contact.add({
          mamRoot: conversation.senderRoot,
          publicKey: conversation.sender.publicKey,
          username: conversation.sender.username
        });
      }
      const checkConversation = Conversation.getById(conversation.seed);
      if (!checkConversation) {
        Conversation.add({
          mamRoot: conversation.mamRoot,
          sideKey: conversation.sideKey,
          seed: conversation.seed
        });
        await joinConversation(iotaSettings, seed, conversation.seed);
        await fetchNewChannelFromConversation(iotaSettings, conversation.seed);
      }
    })
  );
  return conversations;
};

export const updateContactData = iotaSettings => {
  const contacts = Contact.data;
  if (contacts) {
    contacts.forEach(contact => {
      const { mamRoot } = contact;
      fetchContactInfo(iotaSettings, mamRoot)
        .then(contactData => {
          if (contactData && contactData.username) {
            Contact.updateById(mamRoot, { username: contactData.username });
          }
        })
        .catch(error => console.log('Fetch account info error', error));
    });
  }
};
