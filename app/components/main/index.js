import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import zmq from 'zeromq';
import find from 'lodash/find';
import Messenger from './Messenger';
import { getSeed } from '../../libs/crypto';
import { getConversationAddresses, getPasswordHash } from '../../store/selectors/main';
import { getIotaSettings, getTransactionsFromAccount, getZmqDomain } from '../../libs/iota';
import { fetchNewMessagesFromConversation } from '../../libs/conversation';
import { getSettings } from '../../store/selectors/settings';
import { getContactRequest } from '../../libs/contact';
import { Account, Conversation } from '../../storage';
import { setConversationAddresses, setSelfMamRoot } from '../../store/actions/main';

const Main = () => {
  const passwordHash = useSelector(getPasswordHash);
  const settings = useSelector(getSettings);
  const iotaSettings = getIotaSettings(settings);
  const dispatch = useDispatch();
  const socket = zmq.socket('sub');
  const account = Account.data;

  useEffect(() => {
    dispatch(setSelfMamRoot(account.mamRoot));
    let conversationAddresses = Conversation.getAddress();
    console.log(conversationAddresses);
    getSeed(passwordHash, 'string')
      .then(seed => {
        const zmqDomain = getZmqDomain(settings.nodeDomain);
        socket.connect(zmqDomain);
        socket.subscribe('tx');
        socket.on('message', async msg => {
          const data = msg.toString().split(' ');

          if (account.address.substring(0, 81) === data[2]) {
            console.log(data);
            if ((!data[7] && !data[6]) || data[7] === data[6]) {
              try {
                await getTransactionsFromAccount(iotaSettings, seed);
                await getContactRequest(iotaSettings, passwordHash);
                conversationAddresses = Conversation.getAddress();
              } catch (e) {
                console.log(e);
              }
            }
          }
          const conversationAddress = find(conversationAddresses, ['address', data[2]]);
          if (conversationAddress && ((!data[7] && !data[6]) || data[7] === data[6])) {
            await fetchNewMessagesFromConversation(iotaSettings, conversationAddress.seed);
            conversationAddresses = Conversation.getAddress();
            console.log(conversationAddresses);
          }
        });
      })
      .catch(error => console.log('Error getting seed', error));
  }, []);

  return (
    <React.Fragment>
      <Messenger />
    </React.Fragment>
  );
};

export default Main;
