import MAM from '@iota/mam';
import { asciiToTrytes } from '@iota/converter';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../constants/iota';

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
    await MAM.attach(message.payload, message.address, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }

  console.log('MAM state', root);
  return root;
};
