import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Compose.css';
import { createMessage } from '../../../libs/message';
import { getKey } from '../../../libs/crypto';
import { getPasswordHash } from '../../../store/selectors/main';
import { updateMamChannel } from '../../../libs/mam';
import {
  finishLoadingMessageList,
  startLoadingMessageList
} from '../../../store/actions/ui';
import { Conversation } from '../../../storage';

const Compose = props => {
  const [message, setMessage] = useState('');
  const { conversation } = props;
  const passwordHash = useSelector(getPasswordHash);
  const [conversationData, setConversationData] = useState(null);
  const dispatch = useDispatch();

  const keyPressed = e => {
    if (e.key === 'Enter') {
      dispatch(startLoadingMessageList());
      submitMessage()
        .then(result => {
          if (result) setMessage('');
          dispatch(finishLoadingMessageList());
        })
        .catch(error => {
          console.log(error);
          dispatch(finishLoadingMessageList());
        });
    }
  };

  useEffect(() => {
    if (conversation) {
      const conversationObj = Conversation.getById(conversation);
      if (conversationObj) {
        setConversationData({
          sideKey: conversationObj.sideKey,
          seed: conversationObj.seed,
          mamRoot: conversationObj.mamRoot,
          messagesLength: conversationObj.messages.length
        });
      }
    }
  });

  const submitMessage = async () => {
    if (!message || !conversationData) return;
    try {
      const privateKey = await getKey(passwordHash, 'private');
      const messageObj = createMessage(message, privateKey);
      const { seed, sideKey, messagesLength } = conversationData;
      await updateMamChannel(
        messageObj,
        seed,
        'restricted',
        sideKey,
        messagesLength
      );
      return true;
    } catch (e) {
      return false;
      console.log(e);
    }
  };

  return (
    <div className={style.compose}>
      <input
        type="text"
        className={style.composeInput}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message"
        onKeyPress={keyPressed}
      />
    </div>
  );
};
export default Compose;
