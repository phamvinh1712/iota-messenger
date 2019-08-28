import { SettingsActionTypes } from '../types';
import { DEFAULT_DEVNET_DOMAIN, DEFAULT_MAINNET_DOMAIN } from '../../constants/iota';

export const checkAndSetIsDevnet = isDevnet => {
  return (dispatch, getState) => {
    const { healthiestMainNode } = getState().settings;

    if (isDevnet) {
      dispatch(setNodeDomain(DEFAULT_DEVNET_DOMAIN));
    } else {
      if (healthiestMainNode) {
        dispatch(setNodeDomain(healthiestMainNode));
      } else {
        dispatch(setNodeDomain(DEFAULT_MAINNET_DOMAIN));
      }
    }
    dispatch(setIsDevnet(isDevnet));
  };
};

export const setIsDevnet = isDevnet => {
  return {
    type: SettingsActionTypes.SET_IS_DEVNET,
    isDevnet
  };
};

export const setNodeDomain = nodeDomain => ({
  type: SettingsActionTypes.SET_NODE_DOMAIN,
  nodeDomain
});

export const setIsLocalPOW = isLocalPOW => ({
  type: SettingsActionTypes.SET_IS_LOCAL_POW,
  isLocalPOW
});

export const setHealthiestMainNode = node => {
  return {
    type: SettingsActionTypes.SET_HEALTHIEST_MAIN_NODE,
    node
  };
};
