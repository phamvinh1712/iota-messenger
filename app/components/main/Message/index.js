import React from 'react';
import moment from 'moment';
import style from './Message.css';

const Message = props => {
  const { data, isMine, startsSequence, endsSequence, showTimestamp } = props;

  const friendlyTimestamp = moment(data.createdTime).format('LLLL');
  return (
    <div
      className={[
        style.message,
        `${isMine ? style.mine : ''}`,
        `${startsSequence ? style.start : ''}`,
        `${endsSequence ? style.end : ''}`
      ].join(' ')}
    >
      {showTimestamp && <div className={style.timestamp}>{friendlyTimestamp}</div>}

      <div className={style.bubbleContainer}>
        <div className={style.bubble} title={friendlyTimestamp}>
          {data.content}
        </div>
      </div>
    </div>
  );
};

export default Message;
