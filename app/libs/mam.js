import MAM from '@iota/mam';
import { asciiToTrytes } from '@iota/converter';
import { settings } from './iota';
import { DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE } from '../constants/iota';

export const getMamRoot = seed => {
  const mamState = MAM.init(settings, seed);
  return MAM.getRoot(mamState);
};

export const updateMamChannel = async (
  data,
  seed,
  mode,
  sideKey,
  index = 0
) => {
  if (mode === 'restricted' && !sideKey) {
    throw new Error('Restricted mode requires side key');
  }
  let mamState = MAM.init(settings, seed);
  if (mode === 'restricted' && sideKey) {
    mamState = MAM.changeMode(mamState, mode, sideKey);
  } else {
    mamState = MAM.changeMode(mamState, mode);
  }

  if (index) mamState.channel.start = index - 1;

  const root = MAM.getRoot(mamState);
  let result;
  if (mode === 'restricted' && sideKey) {
    console.log('MAM sidekey', sideKey);
    result = await MAM.fetch(root, mode, sideKey);
  } else {
    result = await MAM.fetch(root, mode);
  }
  if (result && result.messages) {
    mamState.channel.start += result.messages.length;
  }
  const trytes = asciiToTrytes(JSON.stringify(data));
  const message = MAM.create(mamState, trytes);
  await MAM.attach(
    message.payload,
    message.address,
    DEFAULT_DEPTH,
    DEFAULT_MIN_WEIGHT_MAGNITUDE
  );
  console.log('MAM state', root);
  return root;
};
