import { Mam as MAM } from '@iota/client-load-balancer';
import { asciiToTrytes, trytes as toTrytes, trits } from '@iota/converter';
import Curl from '@iota/curl';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE, MAX_SEED_LENGTH } from '../constants/iota';
import { randomBytes } from './crypto';
import { byteToChar } from './converter';

export const getMamRoot = (iotaSettings, seed, start = 0) => {
  const mamState = MAM.init(iotaSettings, seed);
  mamState.channel.start = start;
  return MAM.getRoot(mamState);
};

export const updateMamChannel = async (iotaSettings, data, seed, mode, sideKey, start = 0, count = 1) => {
  if (mode === 'restricted' && !sideKey) {
    throw new Error('Restricted mode requires side key');
  }
  let mamState = MAM.init(iotaSettings, seed);
  if (mode === 'restricted' && sideKey) {
    mamState = MAM.changeMode(mamState, mode, sideKey);
  } else {
    mamState = MAM.changeMode(mamState, mode);
  }
  mamState.channel.count = count;
  mamState.channel.next_count = count;
  if (start) mamState.channel.start = start * count - 1;

  const root = MAM.getRoot(mamState);
  let result;
  try {
    if (mode === 'restricted' && sideKey) {
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
    console.log('New message:', message);
    await MAM.attach(message.payload, message.address, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
  console.log('MAM data', data);
  console.log('MAM sideKey', sideKey);
  console.log('MAM root', root);
  return root;
};

export const createChannel = iotaSettings => {
  const conversationSideKey = randomBytes(MAX_SEED_LENGTH, 27)
    .map(byteToChar)
    .join('');

  let mamState = MAM.init(iotaSettings);
  mamState = MAM.changeMode(mamState, 'restricted', conversationSideKey);
  const mamRoot = MAM.getRoot(mamState);
  return {
    sideKey: conversationSideKey,
    mamRoot,
    seed: mamState.seed,
    nextAddress: getAddress(mamRoot)
  };
};

export const getAddress = root => {
  return toTrytes(hash(81, trits(root.slice())));
};

function hash(rounds, ...keys) {
  const curl = new Curl(rounds);
  const key = new Int8Array(Curl.HASH_LENGTH);
  curl.initialize();
  keys.map(k => curl.absorb(k, 0, Curl.HASH_LENGTH));
  curl.squeeze(key, 0, Curl.HASH_LENGTH);
  return key;
}
