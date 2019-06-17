import React from 'react';
import { Public, Lock } from '@material-ui/icons';
import style from './index.module.css';
const unreads = (user, room, messages = {}) => {
  return 2;
  const read = user.readCursor({ roomId: room.id });
  return (
    (read && Object.keys(messages).filter(x => x > read.position).length) ||
    undefined
  );
};

const priority = (user, room, messages = {}) => {
  const unreadMessages = unreads(user, room, messages) || 0;
  const lastMessage = Object.keys(messages).pop() || 0;
  return (10 * unreadMessages + parseInt(lastMessage)) * -1;
};

export const RoomList = ({ rooms = [], user, messages, current, actions }) => (
  <ul className={style.component}>
    {rooms.map(room => {
      const messageKeys = Object.keys(messages[room.id] || {});
      const latestMessage =
        messageKeys.length > 0 && messages[room.id][messageKeys.pop()];
      const firstUser = room.users.find(x => x.id !== user.id);
      const order = priority(user, room, messages[room.id]);
      const unreadCount = unreads(user, room, messages[room.id]);
      return (
        <li
          key={room.id}
          disabled={room.id === current.id}
          onClick={e => actions.joinRoom(room)}
          style={{ order }}
        >
          {room.name.match(user.id) && firstUser ? (
            <img src={firstUser.avatarURL} alt={firstUser.id} />
          ) : room.isPrivate ? (
            <Lock />
          ) : (
            <Public />
          )}
          <col->
            <p>{room.name.replace(user.id, '')}</p>
            <span>{latestMessage && latestMessage.text}</span>
          </col->
          {room.id !== current.id && unreadCount ? (
            <label>{unreadCount}</label>
          ) : null}
        </li>
      );
    })}
  </ul>
);
