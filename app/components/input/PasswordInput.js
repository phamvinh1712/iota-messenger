import React, { useState } from 'react';
import { InputAdornment, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';

const styles = theme => ({
  eye: {
    cursor: 'pointer'
  }
});

const PasswordInput = props => {
  const { onEnter } = props;
  const [masked, setMasked] = useState(true);

  const togglePasswordMasked = () => {
    setMasked(!masked);
  };

  const handleTextFieldKeyDown = event => {
    if (event.key == 'Enter') {
      onEnter();
    }
  };

  const { label, value, onChange, classes } = props;
  return (
    <TextField
      type={masked ? 'password' : 'text'}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleTextFieldKeyDown}
      value={value}
      label={label}
      fullWidth
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
  );
};

PasswordInput.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default withStyles(styles)(PasswordInput);
