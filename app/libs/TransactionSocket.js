import io from 'socket.io-client';
import { asTransactionObject, Transaction } from '@iota/transaction-converter';

export default class TransactionSocket {
  constructor(endpoint, address) {
    this.socket = io(endpoint);
  }

  subscribe() {

  }

  unsubscribe() {

  }
}
