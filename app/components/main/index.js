import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Messenger from './Messenger';
import { getSeed } from '../../libs/crypto';
import { getPasswordHash } from '../../store/selectors/main';
import { getIotaSettings, getTransactionsFromAccount } from '../../libs/iota';
import { fetchNewMessagesFromAllConversation } from '../../libs/conversation';
import { getSettings } from '../../store/selectors/settings';
import { getContactRequest } from '../../libs/contact';
import { Account } from '../../storage';
import { setSelfMamRoot } from '../../store/actions/main';

const Main = () => {
  const passwordHash = useSelector(getPasswordHash);
  const iotaSettings = getIotaSettings(useSelector(getSettings));
  const dispatch = useDispatch();

  useEffect(() => {
    const account = Account.data;
    dispatch(setSelfMamRoot(account.mamRoot));
    console.log(account);
    let seed;
    getSeed(passwordHash, 'string')
      .then(result => {
        seed = result;
      })
      .catch(error => console.log('Error getting seed', error));

    const interval = setInterval(async () => {
      await fetchNewMessagesFromAllConversation(iotaSettings);
      if (seed) {
        try {
          await getTransactionsFromAccount(iotaSettings, seed);
          await getContactRequest(iotaSettings, passwordHash);
        } catch (e) {
          console.log(e);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <React.Fragment>
      <Messenger />
    </React.Fragment>
  );
};

export default Main;
