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
    avatar: 'string?'
  }
};

export const MessageSchema = {
  name: 'Message',
  properties: {
    sender: 'Contact',
    content: 'string',
    createdTime: 'date',
    messageRoot: 'string?',
    index: 'int',
    image: 'string?'
  }
};

export const ConversationSchema = {
  name: 'Conversation',
  primaryKey: 'seed',
  properties: {
    participants: { type: 'Contact[]', default: [] },
    messages: { type: 'Message[]', default: [] },
    mamRoot: 'string',
    sideKey: 'string',
    seed: 'string',
    currentAddress: 'string?'
  }
};

// export const ConversationRequestSchema = {
//   name: 'ConversationRequest',
//   properties: {
//     sender: 'Contact',
//     conversation: 'Conversation'
//   }
// };

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

export const MamQueueSchema = {
  name: 'MamQueue',
  primaryKey: 'uuid',
  properties: {
    uuid: 'string',
    trytes: 'string',
    seed: 'string',
    mode: 'string',
    sideKey: { type: 'string', default: '' },
    isChat: { type: 'bool', default: false },
    addedTime: 'date'
  }
};

export default [
  AccountSchema,
  ContactSchema,
  MessageSchema,
  ConversationSchema,
  TransactionSchema,
  NodeSchema,
  MamQueueSchema
];
