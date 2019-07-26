import { NotificationActionTypes } from '../types';

export const initialState = {
  variant: 'success',
  message: '',
  open: false
};

const notification = (state = initialState, action) => {
  switch (action.type) {
    case NotificationActionTypes.OPEN_NOTIFICATION:
      return {
        open: true,
        variant: action.variant,
        message: action.message
      };

    case NotificationActionTypes.CLOSE_NOTIFICATION:
      return {
        ...state,
        open: false,
        message: ''
      };
    default:
      return state;
  }
};

export default notification;
