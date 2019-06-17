import React from 'react';
import style from './index.module.css';

export const UserList = ({ room, current, createConvo, removeUser }) => (
  <ul className={style.component}>
    {room.users.map(user => (
      <li key={user.id} onClick={e => createConvo({ user })}>
        <img src={user.avatarURL} alt={user.name} />
        <p>{user.name}</p>
      </li>
    ))}
  </ul>
);
