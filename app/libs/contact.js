import MAM from '@iota/mam';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import trimEnd from 'lodash/trimEnd';
import { sendTransfer } from './iota';
import { Account, Contact, Conversation } from '../storage';
import { createConversation, saveConversation, updateConversationParticipants } from './conversation';
import { decryptRSA, encryptRSA, getKey, getSeed } from './crypto';
import { getMamRoot, updateMamChannel } from './mam';
import { composeAPI } from '@iota/core';

export const fetchContactInfo = async (iotaSettings, mamRoot) => {
  const mamState = MAM.init(iotaSettings);
  try {
    const result = await MAM.fetch(mamRoot, 'private');
    if (result && result.messages && result.messages.length) {
      const contact = JSON.parse(trytesToAscii(result.messages[result.messages.length - 1]));

      if (!contact || !contact.username || !contact.publicKey || !contact.address) {
        throw new Error('Invalid contact');
      }
      return contact;
    }
    return null;
  } catch (e) {
    throw new Error(e);
  }
};

export const sendConversationRequest = async (iotaSettings, passwordHash, mamRoot) => {
  const contactInfo = await fetchContactInfo(iotaSettings, mamRoot);
  if (contactInfo && contactInfo.username && contactInfo.publicKey && contactInfo.address) {
    try {
      Contact.add({
        username: contactInfo.username,
        publicKey: contactInfo.publicKey,
        mamRoot
      });
      const conversation = createConversation(iotaSettings);

      const requestMessage = {};
      Object.keys(conversation).forEach(key => {
        if (key !== 'currentAddress') {
          requestMessage[key] = encryptRSA(conversation[key], contactInfo.publicKey);
        }
      });

      const seed = await getSeed(passwordHash, 'string');
      const sideKey = await getKey(passwordHash, 'side');

      requestMessage.senderRoot = encryptRSA(getMamRoot(iotaSettings, seed), contactInfo.publicKey);

      const transfer = [
        {
          address: contactInfo.address,
          value: 0,
          message: asciiToTrytes(JSON.stringify(requestMessage))
        }
      ];

      await updateMamChannel(iotaSettings, Account.data.mamRoot, conversation.seed, 'private');
      await sendTransfer(iotaSettings, seed, transfer);
      const newConversation = saveConversation(conversation, [{ mamRoot }]);
      await updateMamChannel(iotaSettings, newConversation, seed, 'restricted', sideKey);
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
    return true;
  }
  return false;
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

export const getContactRequest = async (iotaSettings, passwordHash) => {
  const privateKey = await getKey(passwordHash, 'private');
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
        console.log(decryptedData);
        if (decryptedData) conversations.push(decryptedData);
      } catch (e) {
        console.log(e);
      }
    })
  );

  await Promise.all(
    conversations.map(async conversation => {
      console.log(conversations);
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
        let mamState = MAM.init(iotaSettings, conversation.seed);
        mamState = MAM.changeMode(mamState, 'restricted', conversation.sideKey);
        const message = MAM.create(mamState, '');

        updateMamChannel(iotaSettings, Account.data.mamRoot, conversation.seed, 'private');

        Conversation.add({
          mamRoot: conversation.mamRoot,
          sideKey: conversation.sideKey,
          seed: conversation.seed,
          currentAddress: message.address
        });
        Conversation.addParticipant(conversation.seed, conversation.senderRoot);
        await updateConversationParticipants(iotaSettings, conversation.seed);
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
