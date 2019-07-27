import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { useSelector, useDispatch } from 'react-redux';

import styles from './landingStyle';
import SeedInput from '../input/SeedInput';
import routes from '../../constants/routes';
import { MAX_SEED_LENGTH } from '../../constants/iota';
import { notify } from '../../actions/notification';
import { setOnboardingSeed } from '../../actions/account';

const SeedConfirm = props => {
  const dispatch = useDispatch();
  const isGenerated = useSelector(
    state => state.account.accountInfoDuringSetup.onboardingSeedGenerated
  );
  const generatedSeed = useSelector(
    state => state.account.accountInfoDuringSetup.onboardingSeed
  );

  const [seed, setSeed] = useState([]);
  const { classes } = props;

  const onContinue = () => {
    if (seed.length < MAX_SEED_LENGTH) {
      dispatch(notify('error', 'Seed is too short'));
      return;
    }
    if (isGenerated) {
      if (
        seed.length !== generatedSeed.length ||
        !generatedSeed.every((v, i) => v % 27 === seed[i] % 27)
      ) {
        dispatch(notify('error', 'Seed does not match'));
        return;
      }
      dispatch(setOnboardingSeed(seed, false));
    }
    props.history.push(routes.REGISTER);
  };

  const onBack = () => {
    if (isGenerated) props.history.push(routes.SEEDGENERATE);
    else props.history.push(routes.INTRO);
  };

  const checkSeed = seed => {
    if (seed.length > MAX_SEED_LENGTH) {
      return;
    }
    setSeed(seed);
  };
  return (
    <Container component="div" maxWidth="sm">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {isGenerated ? 'Confirm your seed' : 'Enter your seed'}
        </Typography>
        <p />
        <SeedInput label="Seed" name="seed" value={seed} onChange={checkSeed} />

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

export default withStyles(styles)(SeedConfirm);
