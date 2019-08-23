import MAM from '@iota/mam';
import { now } from 'moment';
import { decryptRSA, randomBytes } from './crypto';
import { MAX_SEED_LENGTH } from '../constants/iota';
import { byteToChar } from './converter';
import { settings } from './iota';
import { Conversation, Contact } from '../storage';
import { updateMamChannel } from './mam';
import { decryptMessage } from './message';

export const createConversation = () => {
  const sideKey = randomBytes(MAX_SEED_LENGTH, 27)
    .map(byteToChar)
    .join('');
  let mamState = MAM.init(settings);
  mamState = MAM.changeMode(mamState, 'restricted', sideKey);
  const mamRoot = MAM.getRoot(mamState);
  const newConversation = {
    sideKey,
    mamRoot,
    seed: mamState.seed
  };

  return newConversation;
};

export const joinConversation = async (conversationSeed, userRoot) => {
  await updateMamChannel(userRoot, conversationSeed, 'private');
};

export const saveConversation = async (
  conversation,
  contacts,
  seed,
  sideKey
) => {
  Conversation.add(conversation);

  if (contacts && contacts.length) {
    contacts.forEach(contact => {
      Conversation.addParticipant(conversation.mamRoot, contact.mamRoot);
    });
  }
  const newConversation = { ...conversation, participants: contacts };
  updateMamChannel(newConversation, seed, 'restricted', sideKey);
};

export const fetchNewMessagesFromConversation = async conversationRoot => {
  const conversation = Conversation.getById(conversationRoot);
  let mamState = MAM.init(settings, conversation.seed);
  mamState = MAM.changeMode('restricted', conversation.sideKey);
  let index = 0;
  if (conversation.messages.length) {
    mamState.channel.start = conversation.messages.length;
    index = conversation.messages.length;
  }

  const result = await MAM.fetch(
    conversationRoot,
    'restricted',
    conversation.sideKey
  );

  if (result && result.messages) {
    result.messages.forEach(message => {
      if (message.cipherMessage && message.senderRoot && message.createdTime) {
        const messageObj = decryptMessage(message);

        if (messageObj) {
          messageObj.index = index;
          Conversation.addMessage(conversationRoot, messageObj);
          index += 1;
        }
      }
    });
  }
};

export const fetchNewMessagesFromAllConversation = async () => {
  const conversationRoots = Conversation.keys;
  conversationRoots.forEach(key => {
    fetchNewMessagesFromConversation(key);
  });
};
