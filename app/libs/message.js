import { now } from 'moment';
import { Account, Contact } from '../storage';
import { decryptRSA, encryptRSA } from './crypto';

export const decryptMessage = ({ cipherMessage, senderRoot, createdTime }) => {
  const contact = Contact.getById(senderRoot);
  if (contact) {
    const { publicKey } = contact;
    const message = decryptRSA(cipherMessage, publicKey, 'public');
    return { sender: contact, content: message, createdTime };
  }
  return null;
};
/**
 *  Create an encrypted message to attach to MAM
 *  structure of a message is {cipherMessage,senderRoot}
 * @param message
 * @param privateKey
 */
export const createMessage = (message, privateKey) => {
  const { mamRoot } = Account.data;
  const cipherMessage = encryptRSA(message, privateKey, 'private');
  const createdTime = now();

  return { cipherMessage, senderRoot: mamRoot, createdTime };
};
