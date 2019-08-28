import { MainActionTypes } from '../types';
import { Conversation } from '../../storage';

export const setAppPassword = password => ({
  type: MainActionTypes.SET_PASSWORD,
  password
});

export const setCurrentConversationSeed = seed => ({
  type: MainActionTypes.SET_CURRENT_CONVERSATION_SEED,
  seed
});

export const setSelfMamRoot = mamRoot => ({
  type: MainActionTypes.SET_SELF_MAM_ROOT,
  mamRoot
});

export const setConversationAddresses = () => ({
  type: MainActionTypes.SET_CONVERSATION_ADDRESSES,
  conversationAddresses: Conversation.getAddress()
});
