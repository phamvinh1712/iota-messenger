import React from 'react'
import style from './index.module.css';
import Attach from '@material-ui/icons/AttachFile';

export const FileInput = ({ state: { user, message, room } }) =>
  room.id ? (
    <div className={style.container}>
      <Attach/>
      <input
        className={style.component}
        type="file"
        onChange={e => {
          const file = e.target.files[0]
          file &&
            user.sendMessage({
              text: message || file.name,
              roomId: room.id,
              attachment: {
                name: file.name.replace(/[^A-Za-z0-9._-]/g, '--'),
                file,
              },
            })
        }}
      />
    </div>
  ) : null