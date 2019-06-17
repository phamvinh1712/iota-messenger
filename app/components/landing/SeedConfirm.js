import React, { useState } from 'react';
import SeedInput from '../input/SeedInput';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const SeedConfirm = ({ classes }) => {
  const [seed, setSeed] = useState('');

  return (
    <Container component="div" maxWidth="sm">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Enter your seed
        </Typography>
        <p />
        <SeedInput label="Seed" name="seed" value={seed} onChange={setSeed} />
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

export default SeedConfirm;
