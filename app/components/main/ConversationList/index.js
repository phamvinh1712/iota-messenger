import React, { Component } from 'react';
import ConversationSearch from '../ConversationSearch';
import ConversationListItem from '../ConversationListItem';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';

import style from './ConversationList.css';

export default class ConversationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversations: []
    };
  }

  componentDidMount() {
    this.getConversations();
  }

  getConversations = () => {};

  render() {
    return (
      <div className={style.conversationList}>
        <Toolbar
          title="Messenger"
          leftItems={[<ToolbarButton key="cog" icon="ion-ios-cog" />]}
          rightItems={[
            <ToolbarButton key="add" icon="ion-ios-add-circle-outline" />
          ]}
        />
        <ConversationSearch />
        {this.state.conversations.map(conversation => (
          <ConversationListItem key={conversation.name} data={conversation} />
        ))}
      </div>
    );
  }
}
