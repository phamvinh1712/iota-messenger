export const STORAGE_PATH = `${typeof Electron === 'object' ? Electron.getUserDataPath() : ''}/iota-messenger${
  process.env.NODE_ENV === 'development' ? '-dev' : ''
}.realm`;

export const AccountSchema = {
  name: 'Account',
  properties: {
    username: 'string',
    address: 'string',
    privateKey: 'string',
    publicKey: 'string',
    landingComplete: {
      type: 'bool',
      default: false
    },
    mamRoot: 'string',
    sideKey: 'string',
    transactions: 'Transaction[]'
  }
};

export const ContactSchema = {
  name: 'Contact',
  primaryKey: 'mamRoot',
  properties: {
    mamRoot: 'string',
    publicKey: 'string',
    username: 'string',
    address: 'string'
  }
};

export const MessageSchema = {
  name: 'Message',
  properties: {
    content: 'string',
    createdTime: 'date',
    messageRoot: 'string?'
  }
};

export const ConversationSchema = {
  name: 'Conversation',
  primaryKey: 'seed',
  properties: {
    channels: { type: 'Channel[]', default: [] },
    mamRoot: 'string',
    sideKey: 'string',
    seed: 'string',
    nextAddress: 'string?',
    tempName: 'string?'
  }
};

export const ChannelSchema = {
  name: 'Channel',
  primaryKey: 'mamRoot',
  properties: {
    owner: 'Contact?',
    messages: { type: 'Message[]', default: [] },
    sideKey: { type: 'string', default: '' },
    seed: 'string?',
    mamRoot: { type: 'string', default: '' },
    nextRoot: 'string?',
    nextAddress: 'string?',
    self: { type: 'bool', default: false },
    waiting: { type: 'bool', default: false }
  }
};

export const TransactionSchema = {
  name: 'Transaction',
  primaryKey: 'hash',
  properties: {
    hash: 'string',
    signatureMessageFragment: 'string',
    address: 'string',
    value: 'int',
    obsoleteTag: 'string',
    timestamp: 'int',
    currentIndex: 'int',
    lastIndex: 'int',
    tag: 'string',
    trunkTransaction: 'string',
    branchTransaction: 'string',
    bundle: 'string',
    attachmentTimestamp: 'int',
    attachmentTimestampLowerBound: 'int',
    attachmentTimestampUpperBound: 'int',
    nonce: 'string'
  }
};

export const NodeSchema = {
  name: 'Node',
  primaryKey: 'url',
  properties: {
    url: 'string',
    health: 'int?',
    pow: { type: 'bool', default: false }
  }
};

export default [
  AccountSchema,
  ContactSchema,
  MessageSchema,
  ConversationSchema,
  TransactionSchema,
  NodeSchema,
  ChannelSchema
];
