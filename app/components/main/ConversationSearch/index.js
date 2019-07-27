import React, { Component } from 'react';
import style from './ConversationSearch.css';

export default class ConversationSearch extends Component {
  render() {
    return (
      <div className={style.conversationSearch}>
        <input
          type="search"
          className={style.conversationSearchInput}
          placeholder="Search Messages"
        />
      </div>
    );
  }
}
