import { composeAPI } from '@iota/core';
import { asciiToTrytes } from '@iota/converter';
import {
  asTransactionObject,
  asTransactionTrytes
} from '@iota/transaction-converter';
import isFunction from 'lodash/isFunction';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import { head, orderBy, get } from 'lodash';
import { DEFAULT_MIN_WEIGHT_MAGNITUDE, DEFAULT_DEPTH } from '../constants/iota';
import { Account } from '../storage';

export const getTransactionsFromAccount = seed =>
  new Promise((resolve, reject) => {
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
        console.log(transactions);
        if (transactions && transactions.length) {
          Account.update({ transactions });
        }
        console.log(Account.data);
        resolve(true);

      })
      .catch(err => {
        reject(err);
        console.log(err);
      });
  });

export const generateAddress = async seed => {
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
  sendTransfer(seed, transfers);
  return address;
};

export const sendTransfer = (seed, transfers) => {
  iota
    .prepareTransfers(seed, transfers)
    .then(trytes => {
      return iota.sendTrytes(
        trytes,
        DEFAULT_DEPTH,
        DEFAULT_MIN_WEIGHT_MAGNITUDE
      );
    })
    .then(result => console.log('Finish send trytes:', result))
    .catch(error => console.log('Send transfer error', error));
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

  return batchedPow
    ? powFn(trytes, trunkTransaction, branchTransaction, minWeightMagnitude)
    : performSequentialPow(
        powFn,
        getDigest,
        trytes,
        branchTransaction,
        trunkTransaction,
        minWeightMagnitude
      );
};

export const performSequentialPow = (
  powFn,
  digestFn,
  trytes,
  trunkTransaction,
  branchTransaction,
  minWeightMagnitude
) => {
  const transactionObjects = map(trytes, transactionTrytes =>
    assign({}, asTransactionObject(transactionTrytes), {
      attachmentTimestamp: Date.now(),
      attachmentTimestampLowerBound: 0,
      attachmentTimestampUpperBound: (Math.pow(3, 27) - 1) / 2
    })
  );

  // Order transaction objects in descending to make sure it starts from remainder object.
  const sortedTransactionObjects = orderBy(transactionObjects, 'currentIndex', [
    'desc'
  ]);

  return reduce(
    sortedTransactionObjects,
    (promise, transaction, index) => {
      return promise.then(result => {
        const withParentTransactions = assign({}, transaction, {
          trunkTransaction: index
            ? head(result.transactionObjects).hash
            : trunkTransaction,
          branchTransaction: index ? trunkTransaction : branchTransaction
        });

        const transactionTryteString = asTransactionTrytes(
          withParentTransactions
        );

        return powFn(transactionTryteString, minWeightMagnitude)
          .then(nonce => {
            const trytesWithNonce = transactionTryteString
              .substr(0, 2673 - nonce.length)
              .concat(nonce);

            result.trytes.unshift(trytesWithNonce);

            return digestFn(trytesWithNonce).then(digest =>
              asTransactionObject(trytesWithNonce, digest)
            );
          })
          .then(transactionObject => {
            result.transactionObjects.unshift(transactionObject);

            return result;
          });
      });
    },
    Promise.resolve({ trytes: [], transactionObjects: [] })
  );
};

const getDigest = trytes => {
  return Promise.resolve(asTransactionObject(trytes).hash);
};

export const localAttachToTangle = async (
  trunkTransaction,
  branchTransaction,
  minWeightMagnitude = DEFAULT_MIN_WEIGHT_MAGNITUDE,
  trytes
) => {
  try {
    const result = await performPow(
      trytes,
      trunkTransaction,
      branchTransaction,
      minWeightMagnitude
    );
    console.log(result);
    if (get(result, 'trytes') && get(result, 'transactionObjects')) {
      return result.trytes;
    }
    return result;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const settings = {
  // provider: 'https://nodes.devnet.iota.org:443',
  provider: 'https://nodes.thetangle.org:443',
  attachToTangle: localAttachToTangle
};

const iota = composeAPI(settings);

export default iota;
