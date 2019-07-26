import { AccountActionTypes } from '../types';

export const setOnboardingSeed = (seed, isGenerated) => ({
  type: AccountActionTypes.SET_ONBOARDING_SEED,
  seed,
  isGenerated
});
