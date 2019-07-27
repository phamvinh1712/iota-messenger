import React, { Component } from 'react';
import shave from 'shave';

import style from './ConversationListItem.css';

export default class ConversationListItem extends Component {
  componentDidMount() {
    shave(`${style.conversationSnippet}`, 20);
  }

  render() {
    const { photo, name, text } = this.props.data;

    return (
      <div className={style.conversationListItem}>
        <img
          className={style.conversationPhoto}
          src={photo}
          alt="conversation"
        />
        <div>
          <h1 className={style.conversationTitle}>{name}</h1>
          <p className={style.conversationSnippet}>{text}</p>
        </div>
      </div>
    );
  }
}
