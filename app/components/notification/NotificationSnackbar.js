import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';

import NotificationContent from './NotificationContent';
import { closeNotification } from '../../actions/notification';

const useStyles2 = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  }
}));

export default function NotificationSnackbar() {
  const classes = useStyles2();
  const dispatch = useDispatch();
  const notification = useSelector(state => state.notification);

  function handleClick() {
    setOpen(true);
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    dispatch(closeNotification());
  }

  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <NotificationContent
          onClose={handleClose}
          variant={notification.variant}
          message={notification.message}
        />
      </Snackbar>
    </div>
  );
}
