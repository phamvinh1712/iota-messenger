import React from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import styles from './landingStyle';

export default function Intro({classes}) {
  return (
    <Container component="div" maxWidth="sm">
      <div className={classes.paper}>
        <Paper>
          <Typography variant="h5" component="h3">
            Do you need to create a new seed?
          </Typography>
          <Typography component="p">
            Your IOTA seed is the master key to your application. It is 81
            characters long, using only letters A-Z or the number 9
          </Typography>
        </Paper>
        <p></p>
        <Grid container spacing={2}>
          <Grid item xs>
            <Button fullWidth variant="contained">
              No
            </Button>
          </Grid>
          <Grid item xs>
            <Button fullWidth variant="contained" color="primary">
              Yes
            </Button>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
}
