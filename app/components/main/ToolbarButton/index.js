import React, { Component } from 'react';
import style from './ToolbarButton.css';

export default class ToolbarButton extends Component {
  render() {
    const { icon } = this.props;
    return <i className={`${style.toolbarButton} ${icon}`} />;
  }
}
