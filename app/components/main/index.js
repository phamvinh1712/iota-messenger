import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import zmq from 'zeromq';
import find from 'lodash/find';
import Messenger from './Messenger';
import { getSeed } from '../../libs/crypto';
import { getPasswordHash } from '../../store/selectors/main';
import { getIotaSettings, getTransactionsFromAccount, getZmqDomain } from '../../libs/iota';
import { fetchNewChannelFromConversation, fetchNewMessagesFromConversation } from '../../libs/conversation';
import { getSettings } from '../../store/selectors/settings';
import { getContactRequest } from '../../libs/contact';
import { Account, Conversation } from '../../storage';
import { setSelfMamRoot } from '../../store/actions/main';

const Main = () => {
  const passwordHash = useSelector(getPasswordHash);
  const settings = useSelector(getSettings);
  const iotaSettings = getIotaSettings(settings);
  const dispatch = useDispatch();
  const account = Account.data;
  let conversationAddresses;
  let channelAddresses;

  function updateConversationAddress() {
    conversationAddresses = Conversation.getAddress();
    channelAddresses = Conversation.getChannelAddress();
    console.log('conversationAddresses', conversationAddresses);
    console.log('channelAddresses', channelAddresses);
  }

  useEffect(() => {
    dispatch(setSelfMamRoot(account.mamRoot));
    updateConversationAddress();
    const socket = zmq.socket('sub');
    getSeed(passwordHash, 'string')
      .then(seed => {
        const zmqDomain = getZmqDomain(settings.isDevnet);
        socket.connect(zmqDomain);
        socket.subscribe('tx');
        socket.on('message', async msg => {
          const data = msg.toString().split(' ');

          if (account.address.substring(0, 81) === data[2]) {
            console.log(data);
            if ((!data[7] && !data[6]) || data[7] === data[6]) {
              try {
                await getTransactionsFromAccount(iotaSettings, seed);
                await getContactRequest(iotaSettings, seed);
                conversationAddresses = Conversation.getAddress();
              } catch (e) {
                console.log(e);
              }
            }
          }
          const conversationAddress = find(conversationAddresses, ['address', data[2]]);
          if (conversationAddress && ((!data[7] && !data[6]) || data[7] === data[6])) {
            await fetchNewChannelFromConversation(iotaSettings, conversationAddress.seed);
            conversationAddresses = Conversation.getAddress();
            console.log(conversationAddresses);
          }
          const channelAddress = find(channelAddresses, ['address', data[2]]);
          if (channelAddress && ((!data[7] && !data[6]) || data[7] === data[6])) {
            await fetchNewMessagesFromConversation(iotaSettings, conversationAddress.seed);
            channelAddresses = Conversation.getChannelAddress();
            console.log(conversationAddresses);
          }
        });
      })
      .catch(error => console.log('Error getting seed', error));
    return () => socket.close();
  }, []);

  return (
    <React.Fragment>
      <Messenger updateConversationAddress={updateConversationAddress} />
    </React.Fragment>
  );
};

export default Main;
