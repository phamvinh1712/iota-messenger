import { MainActionTypes } from '../types';

export const initialState = {
  password: '',
  currentConversationSeed: '',
  selfMamRoot: '',
  conversationAddresses: []
};

const main = (state = initialState, action) => {
  switch (action.type) {
    case MainActionTypes.SET_PASSWORD:
      return {
        ...state,
        password: action.password
      };
    case MainActionTypes.SET_CURRENT_CONVERSATION_SEED:
      return {
        ...state,
        currentConversationSeed: action.seed
      };
    case MainActionTypes.SET_SELF_MAM_ROOT:
      return {
        ...state,
        selfMamRoot: action.mamRoot
      };
    case MainActionTypes.SET_CONVERSATION_ADDRESSES:
      return {
        ...state,
        conversationAddresses: action.conversationAddresses
      };
    default:
      return state;
  }
};

export default main;
