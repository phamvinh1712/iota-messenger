import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { useDispatch, useSelector } from 'react-redux';
import PasswordInput from '../input/PasswordInput';

import styles from './landingStyle';
import { hash, authorize, getSeed } from '../../libs/crypto';
import { finishLoadingApp, notify, startLoadingApp } from '../../store/actions/ui';
import routes from '../../constants/routes';
import { setAppPassword, setConversationAddresses } from '../../store/actions/main';
import { Account } from '../../storage';
import { setAccountInfo } from '../../store/actions/account';
import { getContactRequest, updateContactData } from '../../libs/contact';
import { getTransactionsFromAccount, getIotaSettings } from '../../libs/iota';
import { getSettings } from '../../store/selectors/settings';
import { fetchNewChannelFromAllConversation, fetchConversations } from '../../libs/conversation';

const Login = props => {
  const dispatch = useDispatch();
  const { classes } = props;
  const [password, setPassword] = useState('');
  const iotaSettings = getIotaSettings(useSelector(getSettings));

  const onSubmit = async () => {
    let passwordHash = null;
    let authorised = false;

    dispatch(startLoadingApp());

    try {
      passwordHash = await hash(password);
    } catch (err) {
      dispatch(finishLoadingApp());
      return dispatch(notify('error', 'Error accessing keychain'));
    }

    try {
      authorised = await authorize(passwordHash);
    } catch (err) {
      dispatch(finishLoadingApp());
      return dispatch(notify('error', 'Unrecognised password'));
    }

    if (authorised) {
      dispatch(setAppPassword(passwordHash));
      setPassword('');

      const { mamRoot, address, username } = Account.data;
      dispatch(setAccountInfo({ mamRoot, address, username }));

      const seed = await getSeed(passwordHash, 'string');

      try {
        await Promise.all([
          getTransactionsFromAccount(iotaSettings, seed),
          getContactRequest(iotaSettings, seed),
          fetchNewChannelFromAllConversation(iotaSettings)
        ]);
        updateContactData(iotaSettings);
        dispatch(setConversationAddresses());
        props.history.push(routes.MAIN);
      } catch (e) {
        console.log(e);
        dispatch(notify('error', 'Cannot login, it might be the server error'));
      }
    }
    return dispatch(finishLoadingApp());
  };
  return (
    <Container component="div" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <PasswordInput label="Password" name="password" value={password} onChange={setPassword} onEnter={onSubmit} />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={onSubmit}
        >
          Sign In
        </Button>
      </div>
    </Container>
  );
};

export default withStyles(styles)(Login);
