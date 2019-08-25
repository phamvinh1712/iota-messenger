import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Refresh from '@material-ui/icons/Refresh';
import Save from '@material-ui/icons/Save';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import withStyles from '@material-ui/core/styles/withStyles';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import zxcvbn from 'zxcvbn';

import { setLandingSeed } from '../../store/actions/account';
import { MAX_SEED_LENGTH } from '../../constants/iota';
import { randomBytes } from '../../libs/crypto';
import { byteToChar } from '../../libs/converter';
import styles from './landingStyle';
import routes from '../../constants/routes';
import PasswordInput from '../input/PasswordInput';
import { notify } from '../../store/actions/ui';

const SeedGenerate = props => {
  const dispatch = useDispatch();
  const [seed, setSeed] = useState(randomBytes(MAX_SEED_LENGTH, 27));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { classes } = props;
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

  const onContinue = () => {
    dispatch(setLandingSeed(seed, true));
    props.history.push(routes.SEEDCONFIRM);
  };

  const onBack = () => {
    dispatch(setLandingSeed(null));
    props.history.push(routes.INTRO);
  };

  const onSeedSave = async () => {
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
      errorMessage += pwEvaluation.feedback.warning ? `\nWarning: ${pwEvaluation.feedback.warning}` : '';
      errorMessage += pwEvaluation.feedback.suggestions.length
        ? `\nSuggestions: ${pwEvaluation.feedback.suggestions.join(' ')}`
        : '';
      dispatch(notify('error', errorMessage.trim()));
      return;
    }
    const error = await Electron.exportSeedToFile(seed, password);

    if (error) {
      dispatch(notify('error', 'Export failed'));
    } else {
      dispatch(notify('success', 'Export success'));
    }
    setPassword('');
    setConfirmPassword('');
    setOpenDialog(false);
  };

  return (
    <Container component="div" maxWidth="xl">
      <div className={classes.paper}>
        <h1>Generated seed</h1>
        <div>
          {seed.map((byte, index) => {
            const c = byteToChar(byte);
            return (
              <Button value={index} key={`${index}-${c}`} onClick={randomPosition}>
                {c}
              </Button>
            );
          })}
        </div>
        <div>
          <Fab color="primary" aria-label="Reset" onClick={reGenerateSeed}>
            <Refresh />
          </Fab>
          <span> </span>
          <Fab color="primary" aria-label="Save" onClick={() => setOpenDialog(true)}>
            <Save />
          </Fab>
        </div>

        <p />
        <Grid container spacing={2}>
          <Grid item xs>
            <Button fullWidth variant="contained" onClick={onBack}>
              Go back
            </Button>
          </Grid>
          <Grid item xs>
            <Button fullWidth variant="contained" color="primary" onClick={onContinue}>
              Continue
            </Button>
          </Grid>
        </Grid>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Seed save</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your Seed can be saved to an encrypted file. Please set a password for your file.
          </DialogContentText>
          <PasswordInput label="Password" name="password" value={password} onChange={setPassword} />
          <p />
          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <p />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={onSeedSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
SeedGenerate.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};
export default withStyles(styles)(SeedGenerate);
