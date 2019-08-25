import MAM from '@iota/mam';
import { asciiToTrytes, trytesToAscii } from '@iota/converter';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import trimEnd from 'lodash/trimEnd';
import { sendTransfer } from './iota';
import { Account, Contact, Conversation } from '../storage';
import { createConversation, saveConversation } from './conversation';
import { decryptRSA, encryptRSA, getKey, getSeed } from './crypto';
import { getMamRoot, updateMamChannel } from './mam';

export const fetchContactInfo = async (iotaSettings, mamRoot) => {
  const mamState = MAM.init(iotaSettings);
  try {
    const result = await MAM.fetch(mamRoot, 'private');
    if (result && result.messages && result.messages.length) {
      const contact = JSON.parse(trytesToAscii(result.messages[result.messages.length - 1]));
      console.log(contact);
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

export const sendContactRequest = async (iotaSettings, passwordHash, mamRoot) => {
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
        requestMessage[key] = encryptRSA(conversation[key], contactInfo.publicKey);
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
      console.log(decryptedData);
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

  for (const key of Object.keys(bundles)) {
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
      continue;
    }
  }

  conversations.forEach(conversation => {
    const checkContact = Contact.getById(conversation.senderRoot);
    if (!checkContact) {
      Contact.add({
        mamRoot: conversation.senderRoot,
        publicKey: conversation.sender.publicKey,
        username: conversation.sender.username
      });
    }
    const checkConversation = Conversation.getById(conversation.mamRoot);
    if (!checkConversation) {
      Conversation.add({
        mamRoot: conversation.mamRoot,
        sideKey: conversation.sideKey,
        seed: conversation.seed
      });
      Conversation.addParticipant(conversation.mamRoot, conversation.senderRoot);
    }
  });
  return conversations;
};
