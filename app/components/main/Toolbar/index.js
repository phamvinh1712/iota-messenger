import React, { Component } from 'react';
import style from './Toolbar.css';

export default class Toolbar extends Component {
  render() {
    const { title, leftItems, rightItems } = this.props;
    return (
      <div className={style.toolbar}>
        <div className={style.leftItems}>{leftItems}</div>
        <h1 className={style.toolbarTitle}>{title}</h1>
        <div className={style.rightItems}>{rightItems}</div>
      </div>
    );
  }
}
