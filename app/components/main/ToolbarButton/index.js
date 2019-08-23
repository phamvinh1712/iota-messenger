import React from 'react';
import style from './ToolbarButton.css';

const ToolbarButton = props => {
  const { icon, onClick } = props;
  return <i className={`${style.toolbarButton} ${icon}`} onClick={onClick} />;
};
export default ToolbarButton;
