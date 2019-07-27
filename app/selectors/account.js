import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';

export const getAccountsFromState = state => state.accounts || {};

export const getAccountInfoDuringSetup = createSelector(
  getAccountsFromState,
  state => state.accountInfoDuringSetup || {}
);

export const isSettingUpNewAccount = createSelector(
  getAccountInfoDuringSetup,
  accountInfoDuringSetup =>
    accountInfoDuringSetup.completed === true &&
    !isEmpty(accountInfoDuringSetup.name) &&
    !isEmpty(accountInfoDuringSetup.meta)
);
