// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import account from './account';
import ui from './ui';
import main from './main';
import settings from './settings';

export default function createRootReducer(history: History) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    account,
    ui,
    main,
    settings
  });
}
