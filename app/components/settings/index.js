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
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import find from 'lodash/find';
import styles from './styles';
import { getSettings } from '../../store/selectors/settings';
import { checkAndSetIsDevnet, setHealthiestMainNode, setIsLocalPOW, setNodeDomain } from '../../store/actions/settings';
import { clearVault, getRealmEncryptionKey } from '../../libs/crypto';
import { ALIAS_REALM } from '../../constants/iota';
import { resetStorage, Node } from '../../storage';
import { notify } from '../../store/actions/ui';

const Settings = props => {
  const { classes } = props;
  const dispatch = useDispatch();
  const settings = useSelector(getSettings);
  const [nodeList, setNodeList] = useState(Node.getDataAsArray());

  useEffect(() => {
    setNodeList(Node.getDataAsArray());
    if (nodeList.length) {
      dispatch(setHealthiestMainNode(nodeList[0].url));
    }
  }, []);

  const handleChangeNetwork = event => {
    const { value } = event.target;
    let result;
    if (value === 'true') {
      result = true;
    } else {
      result = false;
    }
    dispatch(checkAndSetIsDevnet(result));
  };

  const handleChangeDomain = event => {
    console.log(event.target);
    const newDomain = event.target.value;
    if (newDomain) {
      console.log(newDomain);
      const node = find(nodeList, ['url', newDomain]);
      if (!node.pow && !settings.isLocalPOW) {
        dispatch(setIsLocalPOW(true));
        dispatch(notify('info', 'POW is not supported on the chosen node, local POW must be used'));
      }
      dispatch(setNodeDomain(newDomain));
    }
  };

  const handleChangePOW = event => {
    const localPOW = event.target.checked;
    if (!settings.isDevnet && !localPOW) {
      const node = find(nodeList, ['url', settings.nodeDomain]);
      if (node && !node.pow) {
        dispatch(notify('error', "The chosen node doesn't support POW, please choose another node"));
        return;
      }
    }
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

        <FormControl fullWidth variant="outlined" className={classes.formControl} disabled={settings.isDevnet}>
          <Select
            value={settings.isDevnet ? '' : settings.nodeDomain}
            onChange={handleChangeDomain}
            input={<OutlinedInput name="age" id="outlined-age-simple" />}
          >
            <MenuItem value=""></MenuItem>
            {nodeList.map(node => (
              <MenuItem value={node.url}>
                {node.url} {node.pow ? ' | POW' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
