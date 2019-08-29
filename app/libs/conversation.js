import MAM from '@iota/mam';
import { trytesToAscii } from '@iota/converter';
import { randomBytes } from './crypto';
import { MAX_SEED_LENGTH } from '../constants/iota';
import { byteToChar } from './converter';
import { Conversation, Contact } from '../storage';
import { decryptMessage } from './message';

import { composeAPI } from '@iota/core';
import { fetchContactInfo } from './contact';

export const createConversation = iotaSettings => {
  const sideKey = randomBytes(MAX_SEED_LENGTH, 27)
    .map(byteToChar)
    .join('');
  let mamState = MAM.init(iotaSettings);
  mamState = MAM.changeMode(mamState, 'restricted', sideKey);
  const newMessage = MAM.create(mamState, '');
  const mamRoot = MAM.getRoot(mamState);
  const newConversation = {
    sideKey,
    mamRoot,
    seed: mamState.seed,
    currentAddress: newMessage.address
  };

  return newConversation;
};

export const saveConversation = (conversation, contacts) => {
  Conversation.add(conversation);

  if (contacts && contacts.length) {
    contacts.forEach(contact => {
      Conversation.addParticipant(conversation.seed, contact.mamRoot);
    });
  }
  return { ...conversation, participants: contacts };
};

export const fetchNewMessagesFromConversation = async (iotaSettings, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  console.log(conversation);
  let mamState = MAM.init(iotaSettings, conversation.seed);
  mamState = MAM.changeMode(mamState, 'restricted', conversation.sideKey);
  let index = 0;
  if (conversation.messages.length) {
    mamState.channel.start = conversation.messages.length;
    index = conversation.messages.length;
  }
  const root = MAM.getRoot(mamState);
  console.log('root:', root);
  try {
    const result = await MAM.fetch(root, 'restricted', conversation.sideKey);
    console.log(result);
    if (result && result.messages) {
      result.messages.forEach(message => {
        const parsedMessage = JSON.parse(trytesToAscii(message));
        if (parsedMessage.message && parsedMessage.senderRoot && parsedMessage.createdTime && parsedMessage.signature) {
          const messageObj = decryptMessage(conversationSeed, parsedMessage);

          if (messageObj) {
            messageObj.index = index;
            Conversation.addMessage(conversationSeed, messageObj);
            index += 1;
          }
        }
      });
      mamState.channel.start += result.messages.length;
    }
    const newMessage = MAM.create(mamState, '');
    Conversation.updateById(conversationSeed, { currentAddress: newMessage.address });
  } catch (e) {
    console.log(e);
  }
};

export const fetchNewMessagesFromAllConversation = async iotaSettings => {
  const conversationSeeds = Conversation.keys;
  await Promise.all(
    conversationSeeds.map(async key => {
      await fetchNewMessagesFromConversation(iotaSettings, key);
    })
  );
};

export const updateAllConversationParticipants = async iotaSettings => {
  const conversationSeeds = Conversation.keys;
  await Promise.all(
    conversationSeeds.map(async key => {
      await updateConversationParticipants(iotaSettings, key);
    })
  );
};

export const updateConversationParticipants = async (iotaSettings, conversationSeed) => {
  const conversation = Conversation.getById(conversationSeed);
  let mamState = MAM.init(iotaSettings, conversation.seed);
  mamState = MAM.changeMode(mamState, 'private');
  const root = MAM.getRoot(mamState);
  const result = await MAM.fetch(root, 'private');
  const participantRoots = result.messages;

  await Promise.all(
    participantRoots.map(async mamRoot => {
      const contact = Contact.getById(root);
      if (!contact) {
        const contactInfo = await fetchContactInfo(iotaSettings, mamRoot);
        if (contactInfo && contactInfo.username && contactInfo.publicKey && contactInfo.address) {
          Contact.add({
            username: contactInfo.username,
            publicKey: contactInfo.publicKey,
            mamRoot
          });
        }
      }
    })
  );
};
