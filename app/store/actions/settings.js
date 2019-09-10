import { SettingsActionTypes } from '../types';

export const setIsDevnet = isDevnet => {
  return {
    type: SettingsActionTypes.SET_IS_DEVNET,
    isDevnet
  };
};

export const setIsLocalPOW = isLocalPOW => ({
  type: SettingsActionTypes.SET_IS_LOCAL_POW,
  isLocalPOW
});
