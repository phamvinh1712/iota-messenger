import React from 'react';
import style from './index.module.css';
import Add from '@material-ui/icons/Add';
import Lock from '@material-ui/icons/Lock';

const CreateRoomForm = ({ submit }) => (
  <form
    className={style.component}
    onSubmit={e => {
      e.preventDefault();
      submit({
        name: e.target[0].value,
        private: e.target.elements[2].checked
      });
      e.target[0].value = '';
    }}
  >
    <input placeholder="Create a Room" />
    <button>
      <input type="checkbox" />
      <Lock />
    </button>
    <button type="submit">
      <Add />
    </button>
  </form>
);
export default CreateRoomForm;
