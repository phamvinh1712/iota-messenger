import { AccountActionTypes } from '../types';

export const initialState = {
  accountInfoDuringSetup: {
    username: '',
    meta: {},
    onboardingSeed: null,
    onboardingSeedGenerated: false,
    usedExistingSeed: false,
    completed: false
  },
  landingComplete: false,
  accountInfo: {}
};

const account = (state = initialState, action) => {
  switch (action.type) {
    case AccountActionTypes.SET_ONBOARDING_SEED:
      return {
        ...state,
        accountInfoDuringSetup: {
          ...state.accountInfoDuringSetup,
          onboardingSeed: action.seed,
          onboardingSeedGenerated: !!action.isGenerated
        }
      };
    default:
      return state;
  }
};

export default account;
