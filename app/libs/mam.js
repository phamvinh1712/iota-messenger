import MAM from '@iota/mam';
import { asciiToTrytes } from '@iota/converter';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../constants/iota';
import uuidv1 from 'uuid/v1';
import { Conversation, MamQueue } from '../storage';

export const getMamRoot = (iotaSettings, seed) => {
  const mamState = MAM.init(iotaSettings, seed);
  return MAM.getRoot(mamState);
};

export const updateMamChannel = async (iotaSettings, data, seed, mode, sideKey, index = 0) => {
  if (mode === 'restricted' && !sideKey) {
    throw new Error('Restricted mode requires side key');
  }
  let mamState = MAM.init(iotaSettings, seed);
  if (mode === 'restricted' && sideKey) {
    mamState = MAM.changeMode(mamState, mode, sideKey);
  } else {
    mamState = MAM.changeMode(mamState, mode);
  }

  if (index) mamState.channel.start = index - 1;

  const root = MAM.getRoot(mamState);
  let result;
  try {
    if (mode === 'restricted' && sideKey) {
      console.log('MAM sidekey', sideKey);
      result = await MAM.fetch(root, mode, sideKey);
    } else {
      result = await MAM.fetch(root, mode);
    }
  } catch (e) {
    throw new Error(e);
  }

  if (result && result.messages) {
    mamState.channel.start += result.messages.length;
  }
  const trytes = asciiToTrytes(JSON.stringify(data));
  const message = MAM.create(mamState, trytes);
  try {
    console.log(message);
    await MAM.attach(message.payload, message.address, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }

  console.log('MAM state', root);
  return root;
};

export const addMamMessageToQueue = (data, seed, mode, sideKey, isChat) => {
  const trytes = asciiToTrytes(JSON.stringify(data));
  const uuid = uuidv1();
  const mamMessage = {
    trytes,
    uuid,
    seed,
    mode
  };
  if (sideKey) {
    mamMessage.sideKey = sideKey;
  }
  if (isChat) {
    mamMessage.isChat = isChat;
  }

  MamQueue.add(mamMessage);
};

export const attachMamMessage = iotaSettings => {
  const messages = MamQueue.getDataAsArray();
  if (messages.length) {
    messages.forEach(async message => {
      let mamState = MAM.init(iotaSettings, message.seed);
      if (message.mode === 'restricted' && message.sideKey) {
        mamState = MAM.changeMode(mamState, message.mode, message.sideKey);
      } else {
        mamState = MAM.changeMode(mamState, message.mode);
      }

      if (message.isChat) {
        const conversation = Conversation.getById(message.seed);
        if (conversation.messages && conversation.messages.length) {
          mamState.channel.start = conversation.messages.length - 1;
        }
      }
      const root = MAM.getRoot(mamState);
      let result;
      try {
        if (message.mode === 'restricted' && message.sideKey) {
          result = await MAM.fetch(root, message.mode, message.sideKey);
        } else {
          result = await MAM.fetch(root, message.mode);
        }
      } catch (e) {
        throw new Error(e);
      }

      if (result && result.messages) {
        mamState.channel.start += result.messages.length;
      }
      const mamMessage = MAM.create(mamState, message.trytes);
      MAM.attach(mamMessage.payload, mamMessage.address, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE)
        .then(results => {
          MamQueue.delete(message.uuid);
        })
        .catch(error => {
          console.log(error);
        });
    });
  }
};
