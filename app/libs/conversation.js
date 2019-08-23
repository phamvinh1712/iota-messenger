import MAM from '@iota/mam';
import { now } from 'moment';
import { trytesToAscii } from '@iota/converter';
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
  console.log(conversation);
  let mamState = MAM.init(settings, conversation.seed);
  mamState = MAM.changeMode(mamState, 'restricted', conversation.sideKey);
  let index = 0;
  if (conversation.messages.length) {
    mamState.channel.start = conversation.messages.length;
    index = conversation.messages.length;
  }
  const root = MAM.getRoot(mamState);
  try {
    const result = await MAM.fetch(root, 'restricted', conversation.sideKey);
    console.log(result);
    if (result && result.messages) {
      result.messages.forEach(message => {
        const parsedMessage = JSON.parse(trytesToAscii(message));
        if (
          parsedMessage.message &&
          parsedMessage.senderRoot &&
          parsedMessage.createdTime &&
          parsedMessage.signature
        ) {
          const messageObj = decryptMessage(parsedMessage);

          if (messageObj) {
            messageObj.index = index;
            Conversation.addMessage(conversationRoot, messageObj);
            index += 1;
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

export const fetchNewMessagesFromAllConversation = () => {
  const conversationRoots = Conversation.keys;
  conversationRoots.forEach(key => {
    fetchNewMessagesFromConversation(key);
  });
};
