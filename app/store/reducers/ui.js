import { UIActionTypes } from '../types';

export const initialState = {
  notification: {
    variant: 'success',
    message: '',
    open: false
  },
  loading: {
    app: false,
    conversationList: false,
    messageList: false
  }
};

const ui = (state = initialState, action) => {
  switch (action.type) {
    case UIActionTypes.OPEN_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...state.notification,
          open: true,
          variant: action.variant,
          message: action.message
        }
      };

    case UIActionTypes.CLOSE_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...state.notification,
          open: false,
          message: ''
        }
      };
    case UIActionTypes.START_LOADING_APP:
      return {
        ...state,
        loading: {
          ...state.loading,
          app: true
        }
      };
    case UIActionTypes.FINISH_LOADING_APP:
      return {
        ...state,
        loading: {
          ...state.loading,
          app: false
        }
      };
    case UIActionTypes.START_LOADING_CONVERSATION_LIST:
      return {
        ...state,
        loading: {
          ...state.loading,
          conversationList: true
        }
      };
    case UIActionTypes.FINISH_LOADING_CONVERSATION_LIST:
      return {
        ...state,
        loading: {
          ...state.loading,
          conversationList: false
        }
      };
    case UIActionTypes.START_LOADING_MESSAGE_LIST:
      return {
        ...state,
        loading: {
          ...state.loading,
          messageList: true
        }
      };
    case UIActionTypes.FINISH_LOADING_MESSAGE_LIST:
      return {
        ...state,
        loading: {
          ...state.loading,
          messageList: false
        }
      };
    default:
      return state;
  }
};

export default ui;
