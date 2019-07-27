import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import { InputAdornment, withStyles } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import DropZone from 'react-dropzone';
import { byteToChar, charToByte } from '../../libs/converter';
import { useDispatch } from 'react-redux';
import { notify } from '../../actions/notification';
import { MAX_SEED_LENGTH } from '../../constants/iota';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import PasswordInput from './PasswordInput';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

const styles = theme => ({
  eye: {
    cursor: 'pointer'
  },
  dropzone: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  }
});
const SeedInput = props => {
  const { label, value, onChange, classes } = props;
  const dispatch = useDispatch();
  const [masked, setMasked] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [buffer, setBuffer] = useState(null);
  const [password, setPassword] = useState('');
  const togglePasswordMasked = () => {
    setMasked(!masked);
  };

  const onPaste = e => {
    e.preventDefault();
  };

  const readText = text => {
    const seed = text
      .split('')
      .map(char => charToByte(char.toUpperCase()))
      .filter(byte => byte > -1);
    if (seed.length !== MAX_SEED_LENGTH) {
      dispatch(notify('error', 'Invalid Seed from file'));
      return;
    }
    onChange(seed);
  };

  const readBuffer = async buffer => {
    if (!buffer) {
      dispatch(notify('error', 'Invalid file'));
      return;
    }
    const isValidFile = Electron.validateSeedFile(buffer);
    if (!isValidFile) {
      dispatch(notify('error', 'Invalid file'));
      return;
    }
    setBuffer(buffer);
  };

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length === 0) {
      dispatch(
        notify('error', 'No file found. Only text and kdbx files are accepted')
      );
    } else {
      const reader = new FileReader();
      const file = acceptedFiles[0];
      const readFn = file.type === 'text/plain' ? readText : readBuffer;
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        readFn(binaryStr);
      };
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const decryptFile = async password => {
    try {
      const seed = await Electron.importSeedFromFile(buffer, password);
      if (seed.length !== MAX_SEED_LENGTH) {
        dispatch(notify('error', 'Invalid Seed from file'));
        return;
      }
      onChange(seed);
      setBuffer(null);
      setPassword('');
    } catch (error) {
      dispatch(notify('error', 'Fail to decrypt file or seed not found'));
    }
  };

  const mapSeed = seed => seed.map(byte => byteToChar(byte)).join('');
  const mapInput = input =>
    Array.from(input).map(i => charToByte(i.toUpperCase()));
  return (
    <React.Fragment>
      <TextField
        type={masked ? 'password' : 'text'}
        onChange={e => onChange(mapInput(e.target.value))}
        value={mapSeed(value)}
        label={label}
        fullWidth
        autoFocus
        variant="outlined"
        onPaste={onPaste}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {masked ? (
                <VisibilityOff
                  className={classes.eye}
                  onClick={togglePasswordMasked}
                />
              ) : (
                <Visibility
                  className={classes.eye}
                  onClick={togglePasswordMasked}
                />
              )}
            </InputAdornment>
          )
        }}
      />
      <p />
      <DropZone accept=".kdbx,.txt" multiple={false} onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: classes.dropzone })}>
            <input {...getInputProps()} />
            <p>Drag n drop some files here, or click to select files</p>
          </div>
        )}
      </DropZone>
      <Dialog
        open={buffer != null}
        onClose={() => setBuffer(null)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Seed file import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your password to open the encrypted file
          </DialogContentText>
          <PasswordInput
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
          />
          <p />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuffer(null)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => decryptFile(password)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

SeedInput.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired
};

export default withStyles(styles)(SeedInput);
