import { SettingsActionTypes } from '../types';
import { DEFAULT_MAINNET_DOMAIN } from '../../constants/iota';

export const initialState = {
  nodeDomain: DEFAULT_MAINNET_DOMAIN,
  isDevnet: false,
  isLocalPOW: false
};
const settings = (state = initialState, action) => {
  switch (action.type) {
    case SettingsActionTypes.SET_IS_LOCAL_POW:
      return {
        ...state,
        isLocalPOW: action.isLocalPOW
      };
    case SettingsActionTypes.SET_NODE_DOMAIN:
      return {
        ...state,
        nodeDomain: action.nodeDomain
      };
    case SettingsActionTypes.SET_IS_DEVNET:
      return {
        ...state,
        isDevnet: action.isDevnet,
        nodeDomain: action.nodeDomain
      };
    default:
      return state;
  }
};

export default settings;
