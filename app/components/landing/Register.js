import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import PasswordInput from '../input/PasswordInput';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import { useSelector, useDispatch } from 'react-redux';
import zxcvbn from 'zxcvbn';

import styles from './landingStyle';
import { notify } from '../../actions/notification';
import routes from '../../constants/routes';
import { setOnboardingSeed } from '../../actions/account';
import { hash, initKeychain, initVault, addAccount } from '../../libs/crypto';

const Register = props => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const isGenerated = useSelector(
    state => state.account.accountInfoDuringSetup.onboardingSeedGenerated
  );
  const generatedSeed = useSelector(
    state => state.account.accountInfoDuringSetup.onboardingSeed
  );
  const { classes } = props;

  const onBack = () => {
    dispatch(setOnboardingSeed(null));
    if (isGenerated) {
      props.history.push(routes.SEEDGENERATE);
    } else {
      props.history.push(routes.SEEDCONFIRM);
    }
  };

  const onContinue = async () => {
    if (!username.length) {
      dispatch(notify('error', 'Username is empty'));
      return;
    }
    if (!password.length) {
      dispatch(notify('error', 'Password is empty'));
      return;
    }

    if (!confirmPassword.length) {
      dispatch(notify('error', 'Confirm password is empty'));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(notify('error', 'Confirm password does not match'));
      return;
    }

    const pwEvaluation = zxcvbn(password);
    if (pwEvaluation.score < 4) {
      let errorMessage = 'Please choose a stronger password';
      errorMessage += pwEvaluation.feedback.warning
        ? `\nWarning: ${pwEvaluation.feedback.warning}`
        : '';
      errorMessage += pwEvaluation.feedback.suggestions.length
        ? `\nSuggestions: ${pwEvaluation.feedback.suggestions.join(' ')}`
        : '';
      dispatch(notify('error', errorMessage.trim()));
      return;
    }

    try {
      await initKeychain();
    } catch (err) {
      dispatch(notify('error', 'Keychain error'));
    }
    const passwordHash = await hash(password);

    await initVault(passwordHash);
    await addAccount(username, generatedSeed, passwordHash);

    dispatch(setOnboardingSeed(null));
    props.history.push(routes.LOGIN);
  };
  return (
    <Container component="div" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Set a password for your application
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Username"
          name="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
        />
        <p />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <p />
        <Grid container spacing={2}>
          <Grid item xs>
            <Button fullWidth variant="contained" onClick={onBack}>
              Back
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={onContinue}
            >
              Continue
            </Button>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
};
export default withStyles(styles)(Register);
