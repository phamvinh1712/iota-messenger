import { createSelector } from 'reselect';

export const getAccountsFromState = state => state.account || {};

export const getAccountInfoDuringSetup = createSelector(
  getAccountsFromState,
  state => state.accountInfoDuringSetup || {}
);

export const getAccountInfo = state => state.account.accountInfo;
