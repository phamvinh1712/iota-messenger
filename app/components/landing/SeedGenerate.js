import React, { useState, useEffect } from 'react';
import Container from '@material-ui/core/Container';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Refresh from '@material-ui/icons/Refresh';

import { MAX_SEED_LENGTH } from '../../constants/iota';
import { randomBytes } from '../../libs/crypto';
import { byteToChar } from '../../libs/converter';
import styles from './landingStyle';
import Grid from '@material-ui/core/Grid';

const SeedGenerate = ({ classes }) => {
  const [seed, setSeed] = useState(randomBytes(MAX_SEED_LENGTH, 27));

  const randomPosition = e => {
    if (e) {
      e.preventDefault();
    }

    const position = e.currentTarget.value;
    const newSeed = seed.slice(0);
    newSeed[position] = randomBytes(1, 27)[0];
    setSeed(newSeed);
  };

  const reGenerateSeed = () => {
    setSeed(randomBytes(MAX_SEED_LENGTH, 27));
  };

  return (
    <Container component="div" maxWidth="xl">
      <div className={classes.paper}>
        <h1>Generated seed</h1>
        <div>
          {seed.map((byte, index) => {
            const c = byteToChar(byte);
            return (
              <Button
                value={index}
                key={`${index}${c}`}
                onClick={randomPosition}
              >
                {c}
              </Button>
            );
          })}
        </div>

        <Fab color="primary" aria-label="Reset" onClick={reGenerateSeed}>
          <Refresh />
        </Fab>
        <p />
        <Grid container spacing={2}>
          <Grid item xs>
            <Button fullWidth variant="contained">
              Go back
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

export default SeedGenerate;
