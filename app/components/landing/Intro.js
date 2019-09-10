import React from 'react';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import withStyles from '@material-ui/core/styles/withStyles';
import styles from './landingStyle';
import routes from '../../constants/routes';

const Intro = props => {
  const { classes } = props;

  return (
    <Container component="div" maxWidth="sm">
      <div className={classes.paper}>
        <Paper>
          <Typography variant="h5" component="h3">
            Do you need to create a new seed?
          </Typography>
          <Typography component="p">
            Your IOTA seed is the master key to your application. It is 81 characters long, using only letters A-Z or
            the number 9. If you already used the application before, you can use your seed to retrieve all of your data.
          </Typography>
        </Paper>
        <p />
        <Grid container spacing={2}>
          <Grid item xs>
            <Button fullWidth variant="contained" onClick={() => props.history.push(routes.SEEDCONFIRM)}>
              No
            </Button>
          </Grid>
          <Grid item xs>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => props.history.push(routes.SEEDGENERATE)}
            >
              Yes
            </Button>
          </Grid>
        </Grid>
      </div>
    </Container>
  );
};

export default withStyles(styles)(Intro);
