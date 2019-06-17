import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import { InputAdornment, withStyles } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';


const styles = theme => ({
  eye: {
    cursor: 'pointer'
  }
});
const SeedInput = props => {
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
      variant="outlined"
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

SeedInput.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default withStyles(styles)(SeedInput);
