import React, { useState } from 'react';
import { InputAdornment, withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { RemoveRedEye } from '@material-ui/icons';
import PropTypes from 'prop-types';

const styles = theme => ({
  eye: {
    cursor: 'pointer'
  }
});

const PasswordInput = props => {
  const [masked, setMasked] = useState(true);

  const togglePasswordMasked = () => {
    setMasked(!masked);
  };

  const { label, value, onChange, classes } = props;
  return (
    <TextField
      type={masked ? 'password' : 'text'}
      onChange={e => onChange(e.target.value)}
      value={value}
      label={label}
      fullWidth
      autoFocus
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <RemoveRedEye
              className={classes.eye}
              onClick={togglePasswordMasked}
            />
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
  value: PropTypes.func.isRequired
};

export default withStyles(styles)(PasswordInput);
