import { NotificationActionTypes } from '../types';

export const notify = (variant, message) => ({
  type: NotificationActionTypes.OPEN_NOTIFICATION,
  variant,
  message
});

export const closeNotification = () => ({
  type: NotificationActionTypes.CLOSE_NOTIFICATION
});
