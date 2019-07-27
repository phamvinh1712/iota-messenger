import React, { Component } from 'react';
import moment from 'moment';
import style from './Message.css';

export default class Message extends Component {
  render() {
    const {
      data,
      isMine,
      startsSequence,
      endsSequence,
      showTimestamp
    } = this.props;

    const friendlyTimestamp = moment(data.timestamp).format('LLLL');
    return (
      <div
        className={[
          style.message,
          `${isMine ? style.mine : ''}`,
          `${startsSequence ? style.start : ''}`,
          `${endsSequence ? style.end : ''}`
        ].join(' ')}
      >
        {showTimestamp && (
          <div className={style.timestamp}>{friendlyTimestamp}</div>
        )}

        <div className={style.bubbleContainer}>
          <div className={style.bubble} title={friendlyTimestamp}>
            {data.message}
          </div>
        </div>
      </div>
    );
  }
}
