import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import { ipcRenderer } from 'electron';
import routes from './constants/routes';
import Landing from './components/landing/Index';
import Main from './components/main';
import Settings from './components/settings';
import Notification from './components/notification/NotificationSnackbar';
import { Account, initialiseStorage } from './storage';
import { getRealmEncryptionKey } from './libs/crypto';
import { setLandingComplete } from './store/actions/account';

export default props => {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.ui.loading.app);
  const isReady = useSelector(state => state.account.landingComplete && state.main.password);

  const menuEvent = (event, path) => {
    console.log(path);
    props.history.push(path);
  };

  useEffect(() => {
    initialiseStorage(getRealmEncryptionKey)
      .then(async () => {
        const account = Account.data;
        if (account && account.landingComplete) {
          dispatch(setLandingComplete());
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
    if (!isReady) {
      props.history.push(routes.LANDING);
    }
    ipcRenderer.on('menu', menuEvent);

    return () => ipcRenderer.removeAllListeners(['menu']);
  }, []);

  return (
    <React.Fragment>
      <LoadingOverlay active={isLoading} spinner text="Loading...">
        <Switch>
          <Route path={routes.LANDING} component={Landing} />
          <Route path={routes.MAIN} component={Main} />
          <Route path={routes.SETTINGS} component={Settings} />
        </Switch>
        <Notification />
      </LoadingOverlay>
    </React.Fragment>
  );
};
