import { SettingsActionTypes } from '../types';
import {
  DEFAULT_DEVNET_DOMAIN,
  DEFAULT_MAINNET_DOMAIN
} from '../../constants/iota';

export const setIsDevnet = isDevnet => {
  const nodeDomain = isDevnet ? DEFAULT_DEVNET_DOMAIN : DEFAULT_MAINNET_DOMAIN;
  return {
    type: SettingsActionTypes.SET_IS_DEVNET,
    isDevnet,
    nodeDomain
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
