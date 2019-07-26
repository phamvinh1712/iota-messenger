import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import PasswordInput from '../input/PasswordInput';
import styles from './landingStyle';
import withStyles from '@material-ui/core/styles/withStyles';
import { hash, authorize } from '../../libs/crypto';
import { notify } from '../../actions/notification';
import routes from '../../constants/routes';
import { useDispatch } from 'react-redux';

const Login = props => {
  const dispatch = useDispatch();
  const { classes } = props;
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    let passwordHash = null;
    let authorised = false;

    try {
      passwordHash = await hash(password);
    } catch (err) {
      dispatch(notify('error', 'Error accessing keychain'));
    }

    try {
      authorised = await authorize(passwordHash);
    } catch (err) {
      dispatch(notify('error', 'Unrecognised password'));
    }
    if (authorised) {
      setPassword('');
    }
    props.history.push(routes.MAIN);
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
        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
        />
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
