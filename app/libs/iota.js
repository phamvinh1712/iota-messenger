import { asciiToTrytes } from '@iota/converter';
import isFunction from 'lodash/isFunction';
import axios from 'axios';
import { get } from 'lodash';
import {
  DEFAULT_MIN_WEIGHT_MAGNITUDE,
  DEFAULT_DEPTH,
  NODE_LIST_API,
  DEFAULT_DEVNET_ZMQ,
  DEFAULT_MAINNET_DOMAIN,
  DEFAULT_MAINNET_ZMQ
} from '../constants/iota';
import { Account, Node } from '../storage';
const { composeAPI, FailMode, LinearWalkStrategy, SuccessMode } = require('@iota/client-load-balancer');

const getDevnetNodeWalkStrategy = () =>
  new LinearWalkStrategy([
    {
      provider: 'https://altnodes.devnet.iota.org:443',
      depth: 3,
      mwm: 9
    },
    {
      provider: 'https://nodes.devnet.iota.org:443',
      depth: 3,
      mwm: 9
    }
  ]);
const getMainNetPOWStrategy = () =>
  new LinearWalkStrategy(
    Node.getDataAsArray()
      .filter(node => node.pow)
      .map(node => ({ provider: node.url, depth: DEFAULT_DEPTH, mwm: DEFAULT_MIN_WEIGHT_MAGNITUDE }))
  );

const getMainNetAllStrategy = () =>
  new LinearWalkStrategy(
    Node.getDataAsArray().map(node => ({ provider: node.url, depth: DEFAULT_DEPTH, mwm: DEFAULT_MIN_WEIGHT_MAGNITUDE }))
  );

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

export const getIotaSettings = ({ isLocalPOW, isDevnet }) => {
  let nodeWalkStrategy;
  if (isDevnet) nodeWalkStrategy = getDevnetNodeWalkStrategy();
  else if (isLocalPOW) {
    nodeWalkStrategy = getMainNetAllStrategy();
  } else {
    nodeWalkStrategy = getMainNetPOWStrategy();
  }
  const timeoutMs = isLocalPOW ? 300000 : 20000;
  const attachToTangle = isLocalPOW ? localAttachToTangle : undefined;
  return {
    nodeWalkStrategy,
    successMode: SuccessMode.next,
    failMode: FailMode.all,
    timeoutMs,
    attachToTangle,
    tryNodeCallback: node => {
      console.log(`Trying node ${node.provider}`);
    },
    failNodeCallback: (node, err) => {
      console.log(`Failed node ${node.provider}, ${err.message}`);
    }
  };
};

export const getIOTA = settings => {
  return composeAPI(settings);
};

export const getNodeList = async () => {
  const result = await axios.get(NODE_LIST_API);

  const nodes = [];
  nodes.push({ url: DEFAULT_MAINNET_DOMAIN, health: 7, pow: false });

  if (result.data) {
    result.data.map(async node => {
      nodes.push({ url: node.node, health: node.health, pow: node.pow });
    });
  }

  Node.addNodes(nodes);
  console.log('Nodes', Node.getDataAsArray());
};

export const getZmqDomain = isDevnet => {
  if (isDevnet) return DEFAULT_DEVNET_ZMQ;

  return DEFAULT_MAINNET_ZMQ;
};
