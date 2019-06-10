import React, { useState } from 'react';
import PasswordInput from '../input/PasswordInput';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const Login = () => {
  const classes = useStyles();
  const [password, setPassword] = useState('');

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <h2>Login</h2>
        <PasswordInput
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
        />
      </div>
    </Container>
  );
};

export default Login;
