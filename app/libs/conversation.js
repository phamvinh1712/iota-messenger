import MAM from '@iota/mam';
import { trytesToAscii } from '@iota/converter';
import { randomBytes } from './crypto';
import { MAX_SEED_LENGTH } from '../constants/iota';
import { byteToChar } from './converter';
import { Conversation } from '../storage';
import { decryptMessage } from './message';

export const createConversation = iotaSettings => {
  const sideKey = randomBytes(MAX_SEED_LENGTH, 27)
    .map(byteToChar)
    .join('');
  let mamState = MAM.init(iotaSettings);
  mamState = MAM.changeMode(mamState, 'restricted', sideKey);
  const mamRoot = MAM.getRoot(mamState);
  const newConversation = {
    sideKey,
    mamRoot,
    seed: mamState.seed
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
          const messageObj = decryptMessage(parsedMessage);

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

export const fetchNewMessagesFromAllConversation = iotaSettings => {
  const conversationSeeds = Conversation.keys;
  conversationSeeds.forEach(key => {
    fetchNewMessagesFromConversation(iotaSettings, key);
  });
};
