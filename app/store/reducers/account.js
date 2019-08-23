import { AccountActionTypes } from '../types';

export const initialState = {
  accountInfoDuringSetup: {
    username: '',
    landingSeed: null,
    landingSeedGenerated: false,
    usedExistingSeed: false
  },
  landingComplete: false,
  accountInfo: {
    username: '',
    address: '',
    mamRoot: ''
  }
};

const account = (state = initialState, action) => {
  switch (action.type) {
    case AccountActionTypes.SET_LANDING_SEED:
      return {
        ...state,
        accountInfoDuringSetup: {
          ...state.accountInfoDuringSetup,
          landingSeed: action.seed,
          landingSeedGenerated: !!action.isGenerated
        }
      };
    case AccountActionTypes.SET_LANDING_COMPLETE:
      return {
        ...state,
        landingComplete: true
      };
    case AccountActionTypes.SET_ACCOUNT_INFO:
      return {
        ...state,
        accountInfo: {
          ...state.accountInfo,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export default account;
