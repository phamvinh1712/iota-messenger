import React, { useEffect } from 'react';
import shave from 'shave';
import { useDispatch } from 'react-redux';

import style from './ConversationListItem.css';
import { setCurrentConversationRoot } from '../../../store/actions/main';

const ConversationListItem = props => {
  const { username, lastMessage, mamRoot } = props.data;
  const dispatch = useDispatch();

  useEffect(() => {
    shave(`${style.conversationSnippet}`, 20);
  });

  const onItemClick = () => {
    dispatch(setCurrentConversationRoot(mamRoot));
  };

  return (
    <div className={style.conversationListItem} onClick={onItemClick}>
      {/*<img*/}
      {/*  className={style.conversationPhoto}*/}
      {/*  src={photo}*/}
      {/*  alt="conversation"*/}
      {/*/>*/}
      <div>
        <h1 className={style.conversationTitle}>{username}</h1>
        <p className={style.conversationSnippet}>{lastMessage}</p>
      </div>
    </div>
  );
};
export default ConversationListItem;
