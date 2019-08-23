import { MainActionTypes } from '../types';

export const setAppPassword = password => ({
  type: MainActionTypes.SET_PASSWORD,
  password
});

export const setCurrentConversationRoot = mamRoot => ({
  type: MainActionTypes.SET_CURRENT_CONVERSATION_ROOT,
  mamRoot
});

export const setSelfMamRoot = mamRoot => ({
  type: MainActionTypes.SET_SELF_MAM_ROOT,
  mamRoot
});
