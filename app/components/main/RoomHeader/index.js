import React from 'react';
import style from './index.module.css';
import { People } from '@material-ui/icons';

export const RoomHeader = ({
  state: { room, user, sidebarOpen, userListOpen },
  actions: { setSidebarOpen, setUserListOpen }
}) => (
  <header className={style.component}>
    <button onClick={e => setSidebarOpen(!sidebarOpen)}>
      <svg>
        <use xlinkHref="index.svg#menu" />
      </svg>
    </button>
    <h1>{room.name && room.name.replace(user.id, '')}</h1>
    {room.users && (
      <div onClick={e => setUserListOpen(!userListOpen)}>
        <span>{room.users.length}</span>
        <People />
      </div>
    )}
  </header>
);
