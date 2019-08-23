import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Compose from '../Compose';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import Message from '../Message';

import style from './MessageList.css';
import {
  getCurrentConversation,
  getSelfMamRoot
} from '../../../store/selectors/main';
import { Conversation } from '../../../storage';

const MessageList = props => {
  const [messages, setMessages] = useState([]);
  const currentConversation = useSelector(getCurrentConversation);
  const selfMamRoot = useSelector(getSelfMamRoot);

  useEffect(() => {
    getMessages();
  });

  const getMessages = () => {
    if (currentConversation) {
      setMessages(Conversation.getMessagesFromId(currentConversation));
    }
  };

  const renderMessages = () => {
    let i = 0;
    const renderedMessages = [];
    const messageCount = messages.length;
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = current.sender.mamRoot === selfMamRoot;
      const currentMoment = moment(current.createdTime);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.createdTime);
        const previousDuration = moment.duration(
          currentMoment.diff(previousMoment)
        );
        prevBySameAuthor = previous.sender.mamRoot === current.sender.mamRoot;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdTime);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.sender.mamRoot === current.sender.mamRoot;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }

      renderedMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />
      );

      // Proceed to the next message.
      i += 1;
    }

    return renderedMessages;
  };

  return (
    <div>
      <Toolbar
        title="Conversation Title"
        rightItems={[
          <ToolbarButton key="info" icon="ion-ios-information-circle-outline" />
        ]}
      />

      <div className={style.messageListContainer}>{renderMessages()}</div>

      {currentConversation ? (
        <Compose conversation={currentConversation} />
      ) : (
        ''
      )}
    </div>
  );
};
export default MessageList;
