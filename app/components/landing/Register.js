import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import PasswordInput from '../input/PasswordInput';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

const Register = ({ classes }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <Container component="div" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Set a password for your application
        </Typography>
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
            <Button fullWidth variant="contained">
              Back
            </Button>
          </Grid>
          <Grid item xs>
            <Button fullWidth variant="contained" color="primary">
              Continue
            </Button>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
};
export default Register;
