export const MAX_SEED_LENGTH = 81;

export const MAX_SEED_TRITS = MAX_SEED_LENGTH * 3;

export const SEED_CHECKSUM_LENGTH = 3;

export const ADDRESS_LENGTH_WITHOUT_CHECKSUM = MAX_SEED_LENGTH;

export const ADDRESS_LENGTH = 90;

export const CHECKSUM_LENGTH = ADDRESS_LENGTH - ADDRESS_LENGTH_WITHOUT_CHECKSUM;

export const VALID_SEED_REGEX = /^[A-Z9]+$/;

export const VALID_ADDRESS_WITHOUT_CHECKSUM_REGEX = VALID_SEED_REGEX;

export const VALID_ADDRESS_WITH_CHECKSUM_REGEX = /^[A-Z9]{90}$/;

export const TOTAL_IOTA_SUPPLY = 2779530283277761;

export const HASH_SIZE = 81;

export const TRANSACTION_TRYTES_SIZE = 2673;

export const EMPTY_HASH_TRYTES = '9'.repeat(HASH_SIZE);

export const EMPTY_TRANSACTION_TRYTES = '9'.repeat(TRANSACTION_TRYTES_SIZE);

export const EMPTY_TRANSACTION_MESSAGE = 'Empty';

export const ALIAS_REALM = 'realm_enc_key';

export const DEFAULT_DEPTH = 4;

export const DEFAULT_MIN_WEIGHT_MAGNITUDE = 14;

export const DEFAULT_MAINNET_DOMAIN = 'https://nodes.iota.org:443';

export const DEFAULT_DEVNET_DOMAIN = 'https://nodes.devnet.iota.org:443';

export const DEFAULT_DEVNET_ZMQ = 'tcp://zmq.devnet.iota.org:5556';

export const DEFAULT_MAINNET_ZMQ = 'tcp://nodes.iota.org:5556';

export const NODE_LIST_API = 'https://nodes.iota.works/api/ssl/live';

export const ZMP_PORT = '5556';

export const DEFAULT_PORT = '443';
