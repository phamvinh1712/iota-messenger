import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';
import './index.css';
import { UserHeader } from './UserHeader';
import { UserList } from './UserList';
import { MessageList } from './MessageList';
import { CreateMessageForm } from './CreateMessageForm';
import { RoomList } from './RoomList';
import { RoomHeader } from './RoomHeader';
import CreateRoomForm from './CreateRoomForm';
import { WelcomeScreen } from './WelcomeScreen';
import { JoinRoomScreen } from './JoinRoomScreen';

export default function Main() {
  const [user, setUser] = useState({
    id: '1',
    name: 'test',
    avatarURL: 'https://avatars1.githubusercontent.com/u/17719554?s=460&v=4'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rooms, setRooms] = useState([
    { id: 1, name: 'test room name', users: [user] }
  ]);
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState({
    id: 1,
    name: 'test room name',
    users: [user]
  });
  const [userListOpen, setUserListOpen] = useState(window.innerWidth > 1000);
  const addContact = () => {};
  const createConvo = () => {};
  const removeUserFromRoom = () => {};
  const runCommand = () => {};
  return (
    <main>
      <aside data-open={sidebarOpen}>
        <UserHeader user={user} />
        <RoomList
          user={user}
          rooms={rooms}
          messages={messages}
          current={room}
        />
        {user.id && <CreateRoomForm submit={addContact} />}
      </aside>
      <section>
        <RoomHeader
          state={{
            room,
            user,
            sidebarOpen,
            userListOpen
          }}
          actions={{
            setSidebarOpen,
            setUserListOpen
          }}
        />
        {room.id ? (
          <row->
            <col->
              <MessageList
                user={user}
                messages={messages[room.id]}
                createConvo={createConvo}
              />
              <CreateMessageForm
                state={{ user, room, message: '' }}
                actions={{ runCommand }}
              />
            </col->
            {userListOpen && (
              <UserList
                room={room}
                current={user.id}
                createConvo={createConvo}
                removeUser={removeUserFromRoom}
              />
            )}
          </row->
        ) : user.id ? (
          <JoinRoomScreen />
        ) : (
          <WelcomeScreen />
        )}
      </section>
    </main>
  );
}
