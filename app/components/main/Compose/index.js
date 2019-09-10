import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Compose.css';
import { updateMamChannel } from '../../../libs/mam';
import { finishLoadingMessageList, startLoadingMessageList } from '../../../store/actions/ui';
import { Conversation } from '../../../storage';
import { getSettings } from '../../../store/selectors/settings';
import { getIotaSettings } from '../../../libs/iota';
import { now } from 'moment';

const Compose = props => {
  const [message, setMessage] = useState('');
  const { conversation } = props;
  const [channelData, setChannelData] = useState(null);
  const dispatch = useDispatch();
  const iotaSettings = getIotaSettings(useSelector(getSettings));

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
      const channel = Conversation.getSelfChannelFromId(conversation);
      if (channel) {
        setChannelData({
          sideKey: channel.sideKey,
          seed: channel.seed,
          mamRoot: channel.mamRoot,
          messagesLength: channel.messages.length
        });
      }
    }
  });

  const submitMessage = async () => {
    if (!message || !channelData) return;
    try {
      const messageObj = { content: message, createdTime: now() };
      const { seed, sideKey, messagesLength } = channelData;
      await updateMamChannel(iotaSettings, messageObj, seed, 'restricted', sideKey, messagesLength);
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
