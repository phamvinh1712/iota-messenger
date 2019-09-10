import { SettingsActionTypes } from '../types';

export const initialState = {
  isDevnet: false,
  isLocalPOW: true
};
const settings = (state = initialState, action) => {
  switch (action.type) {
    case SettingsActionTypes.SET_IS_LOCAL_POW:
      return {
        ...state,
        isLocalPOW: action.isLocalPOW
      };
    case SettingsActionTypes.SET_IS_DEVNET:
      return {
        ...state,
        isDevnet: action.isDevnet
      };
    default:
      return state;
  }
};

export default settings;
