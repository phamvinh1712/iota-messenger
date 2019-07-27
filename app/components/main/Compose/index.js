import React, { Component } from 'react';
import style from './Compose.css';

export default class Compose extends Component {
  render() {
    return (
      <div className={style.compose}>
        <input
          type="text"
          className={style.composeInput}
          placeholder="Type a message, @name"
        />

        {this.props.rightItems}
      </div>
    );
  }
}
