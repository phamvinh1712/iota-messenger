import { UIActionTypes } from '../types';

export const notify = (variant, message) => ({
  type: UIActionTypes.OPEN_NOTIFICATION,
  variant,
  message
});

export const closeNotification = () => ({
  type: UIActionTypes.CLOSE_NOTIFICATION
});

export const startLoadingApp = () => ({
  type: UIActionTypes.START_LOADING_APP
});

export const finishLoadingApp = () => ({
  type: UIActionTypes.FINISH_LOADING_APP
});

export const startLoadingConversationList = () => ({
  type: UIActionTypes.START_LOADING_CONVERSATION_LIST
});

export const finishLoadingConversationList = () => ({
  type: UIActionTypes.FINISH_LOADING_CONVERSATION_LIST
});

export const startLoadingMessageList = () => ({
  type: UIActionTypes.START_LOADING_MESSAGE_LIST
});

export const finishLoadingMessageList = () => ({
  type: UIActionTypes.FINISH_LOADING_MESSAGE_LIST
});
