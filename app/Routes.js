import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import routes from './constants/routes';
import Landing from './components/landing/Index';
import Main from './components/main';
import Notification from './components/notification/NotificationSnackbar';
import { Account, initialiseStorage } from './storage';
import { getRealmEncryptionKey } from './libs/crypto';
import { setLandingComplete } from './store/actions/account';
import { setSelfMamRoot } from './store/actions/main';

export default props => {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.ui.loading.app);
  const isReady = useSelector(
    state => state.account.landingComplete && state.main.password
  );

  useEffect(() => {
    initialiseStorage(getRealmEncryptionKey)
      .then(async () => {
        const account = Account.data;
        if (account && account.landingComplete) {
          dispatch(setLandingComplete());
          dispatch(setSelfMamRoot(account.mamRoot));
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
    if (!isReady) {
      props.history.push(routes.LANDING);
    }
  }, []);

  return (
    <React.Fragment>
      <LoadingOverlay active={isLoading} spinner text="Loading...">
        <Switch>
          <Route path={routes.LANDING} component={Landing} />
          <Route path={routes.MAIN} component={Main} />
        </Switch>
        <Notification />
      </LoadingOverlay>
    </React.Fragment>
  );
};
