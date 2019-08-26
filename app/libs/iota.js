import { composeAPI } from '@iota/core';
import { asciiToTrytes } from '@iota/converter';
import isFunction from 'lodash/isFunction';
import { get } from 'lodash';
import { DEFAULT_MIN_WEIGHT_MAGNITUDE, DEFAULT_DEPTH } from '../constants/iota';
import { Account } from '../storage';

export const getTransactionsFromAccount = (iotaSettings, seed) =>
  new Promise((resolve, reject) => {
    const iota = getIOTA(iotaSettings);
    iota
      .getAccountData(seed, {
        start: 0,
        security: 2
      })
      .then(accountData => {
        const { addresses } = accountData;
        return iota.findTransactionObjects({ addresses });
      })
      .then(transactions => {
        if (transactions && transactions.length) {
          Account.update({ transactions });
        }
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });

export const generateAddress = async (iotaSettings, seed) => {
  const iota = getIOTA(iotaSettings);
  const addresses = await iota.getNewAddress(seed, {
    checksum: true,
    total: 1
  });
  const address = addresses[0];
  const transfers = [
    {
      address,
      value: 0,
      message: asciiToTrytes('Address to receive friend request')
    }
  ];
  sendTransfer(iotaSettings, seed, transfers);
  return address;
};

export const sendTransfer = (iotaSettings, seed, transfers) => {
  const iota = getIOTA(iotaSettings);
  iota
    .prepareTransfers(seed, transfers)
    .then(trytes => {
      return iota.sendTrytes(trytes, DEFAULT_DEPTH, DEFAULT_MIN_WEIGHT_MAGNITUDE);
    })
    .then(result => console.log('Finish send trytes:', result))
    .catch(error => {
      console.log('Send transfer error', error);
      throw new Error(error);
    });
};

export const performPow = (
  trytes,
  trunkTransaction,
  branchTransaction,
  minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
  batchedPow = true
) => {
  const powFn = Electron.getPowFn(batchedPow);
  if (!isFunction(powFn)) {
    return Promise.reject(new Error('POW function undefined'));
  }

  return powFn(trytes, trunkTransaction, branchTransaction, minWeightMagnitude);
};

export const localAttachToTangle = async (
  trunkTransaction,
  branchTransaction,
  minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
  trytes
) => {
  try {
    console.log('Local POW on');
    const result = await performPow(trytes, trunkTransaction, branchTransaction, minWeightMagnitude);

    if (get(result, 'trytes') && get(result, 'transactionObjects')) {
      return result.trytes;
    }
    return result;
  } catch (err) {
    console.log('Local POW error', err);
    return null;
  }
};

export const getIotaSettings = ({ isLocalPOW, nodeDomain }) => {
  if (isLocalPOW) {
    return {
      provider: nodeDomain,
      attachToTangle: localAttachToTangle
    };
  }
  return {
    provider: nodeDomain
  };
};

export const getIOTA = settings => {
  return composeAPI(settings);
};
