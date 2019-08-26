import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Container from '@material-ui/core/Container';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import styles from './styles';
import { getSettings } from '../../store/selectors/settings';
import { setIsDevnet, setIsLocalPOW, setNodeDomain } from '../../store/actions/settings';
import TextField from '@material-ui/core/TextField';
import { clearVault, getRealmEncryptionKey } from '../../libs/crypto';
import { ALIAS_REALM } from '../../constants/iota';
import { resetStorage } from '../../storage';
import { notify } from '../../store/actions/ui';

const Settings = props => {
  const { classes } = props;
  const dispatch = useDispatch();
  const settings = useSelector(getSettings);
  const [nodeDomain, setLocalNodeDomain] = useState('');

  useEffect(() => {
    setLocalNodeDomain(settings.nodeDomain);
  });

  const handleChangeNetwork = event => {
    const { value } = event.target;
    let result;
    if (value === 'true') {
      result = true;
    } else {
      result = false;
    }
    dispatch(setIsDevnet(result));
  };

  const handleChangePOW = event => {
    dispatch(setIsLocalPOW(event.target.checked));
  };

  const resetApp = async () => {
    try {
      await clearVault([ALIAS_REALM]);
      await resetStorage(getRealmEncryptionKey);
      Electron.reload();
      dispatch(notify('success', 'Reset application sucess'));
    } catch (e) {
      console.log('e');
      dispatch(notify('error', 'Reset application failed'));
    }
  };

  const saveNodeDomain = () => {
    dispatch(setNodeDomain(nodeDomain));
    dispatch(notify('success', 'Save node domain success'));
  };

  return (
    <Container component="div" maxWidth="sm">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Settings
        </Typography>
        <Divider />
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Choose to have POW local or offload to node</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Switch className={classes.group} onChange={handleChangePOW} checked={settings.isLocalPOW} />}
              label="Local POW"
            />
          </FormGroup>
        </FormControl>
        <Divider />
        <FormControl component="fieldset" className={classes.formControl}>
          <FormLabel component="legend">Devnet or Mainnet?</FormLabel>
          <RadioGroup
            aria-label="gender"
            name="gender1"
            className={classes.group}
            value={settings.isDevnet ? 'true' : 'false'}
            onChange={handleChangeNetwork}
          >
            <FormControlLabel value="true" control={<Radio color="primary" />} label="Dev net" />
            <FormControlLabel value="false" control={<Radio color="primary" />} label="Main net" />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth component="fieldset">
          <FormLabel component="legend">Current domain</FormLabel>
          <TextField
            type="text"
            fullWidth
            onChange={e => setLocalNodeDomain(e.event.target)}
            value={nodeDomain}
            variant="outlined"
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={saveNodeDomain}
        >
          Save
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={() => props.history.goBack()}
        >
          Back
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="secondary"
          className={classes.submit}
          onClick={resetApp}
        >
          Reset application
        </Button>
      </div>
    </Container>
  );
};
export default withStyles(styles)(Settings);
