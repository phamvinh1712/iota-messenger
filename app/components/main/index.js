import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Messenger from './Messenger';
import { getSeed } from '../../libs/crypto';
import { getPasswordHash } from '../../store/selectors/main';
import { getTransactionsFromAccount } from '../../libs/iota';
import { fetchNewMessagesFromAllConversation } from '../../libs/conversation';

const Main = () => {
  const passwordHash = useSelector(getPasswordHash);

  useEffect(() => {
    let seed;
    getSeed(passwordHash, 'string')
      .then(result => {
        seed = result;
      })
      .catch(error => console.log('Error getting seed', error));

    const interval = setInterval(async () => {
      await fetchNewMessagesFromAllConversation();
      // if (seed) {
      //   await getTransactionsFromAccount(seed);
      // }
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
