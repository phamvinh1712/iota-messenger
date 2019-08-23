import { AccountActionTypes } from '../types';
import { Account } from '../../storage';

export const setLandingSeed = (seed, isGenerated) => ({
  type: AccountActionTypes.SET_LANDING_SEED,
  seed,
  isGenerated
});

export const setLandingComplete = () => {
  Account.setLandingComplete();

  return {
    type: AccountActionTypes.SET_LANDING_COMPLETE
  };
};

export const setAccountInfo = payload => {
  return {
    type: AccountActionTypes.SET_ACCOUNT_INFO,
    payload
  };
};
