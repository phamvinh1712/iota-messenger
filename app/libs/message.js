import { now } from 'moment';
import { Account, Contact } from '../storage';
import { verifySignatureRSA, signRSA } from './crypto';

export const decryptMessage = ({ message, senderRoot, createdTime, signature }) => {
  const contact = Contact.getById(senderRoot);
  if (contact) {
    const { publicKey } = contact;
    if (verifySignatureRSA(message, signature, publicKey)) {
      return {
        sender: contact,
        content: message,
        createdTime: new Date(createdTime)
      };
    }
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
  const signature = signRSA(message, privateKey);
  const createdTime = now();

  return { message, signature, senderRoot: mamRoot, createdTime };
};
