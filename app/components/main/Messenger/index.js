import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import { useSelector } from 'react-redux';
import ConversationList from '../ConversationList';
import MessageList from '../MessageList';
import style from './Messenger.css';

const Messenger = () => {
  const isLoading = useSelector(state => state.ui.loading);

  return (
    <div className={style.messenger}>
      <div className={`${style.scrollable} ${style.sidebar}`}>
        <LoadingOverlay
          active={isLoading.conversationList}
          spinner
          text="Loading..."
        >
          <ConversationList />
        </LoadingOverlay>
      </div>

      <div className={`${style.scrollable} ${style.content}`}>
        <LoadingOverlay
          active={isLoading.messageList}
          spinner
          text="Loading..."
        >
          <MessageList />
        </LoadingOverlay>
      </div>
    </div>
  );
};
export default Messenger;
