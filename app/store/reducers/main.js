import { MainActionTypes } from '../types';

export const initialState = {
  password: '',
  currentConversationRoot: '',
  selfMamRoot :''
};

const main = (state = initialState, action) => {
  switch (action.type) {
    case MainActionTypes.SET_PASSWORD:
      return {
        ...state,
        password: action.password
      };
    case MainActionTypes.SET_CURRENT_CONVERSATION_ROOT:
      return {
        ...state,
        currentConversationRoot: action.mamRoot
      };
    case MainActionTypes.SET_SELF_MAM_ROOT:
      return {
        ...state,
        selfMamRoot: action.mamRoot
      };
    default:
      return state;
  }
};

export default main;
