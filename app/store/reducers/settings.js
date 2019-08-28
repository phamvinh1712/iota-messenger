import { SettingsActionTypes } from '../types';
import { DEFAULT_DEVNET_DOMAIN, DEFAULT_MAINNET_DOMAIN } from '../../constants/iota';

export const initialState = {
  nodeDomain: DEFAULT_DEVNET_DOMAIN,
  isDevnet: true,
  isLocalPOW: true,
  healthiestMainNode: ''
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
        isDevnet: action.isDevnet
      };
    case SettingsActionTypes.SET_HEALTHIEST_MAIN_NODE:
      return {
        ...state,
        healthiestMainNode: action.node
      };
    default:
      return state;
  }
};

export default settings;
