import React, { useEffect } from 'react';
import shave from 'shave';
import { useDispatch } from 'react-redux';

import style from './ConversationListItem.css';
import { setCurrentConversationSeed } from '../../../store/actions/main';

const ConversationListItem = props => {
  const { conversationName, lastMessage, seed } = props.data;
  const dispatch = useDispatch();

  useEffect(() => {
    shave(`${style.conversationSnippet}`, 20);
  });

  const onItemClick = () => {
    dispatch(setCurrentConversationSeed(seed));
  };

  return (
    <div className={style.conversationListItem} onClick={onItemClick}>
      {/*<img*/}
      {/*  className={style.conversationPhoto}*/}
      {/*  src={photo}*/}
      {/*  alt="conversation"*/}
      {/*/>*/}
      <div>
        <h1 className={style.conversationTitle}>{conversationName}</h1>
        <p className={style.conversationSnippet}>{lastMessage}</p>
      </div>
    </div>
  );
};
export default ConversationListItem;
