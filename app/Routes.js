import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Landing from './components/landing/Index';
import Main from './components/main/Index';

export default () => (
  <App>
    <Switch>
      <Route exact path={routes.LANDING} component={Landing} />
      <Route path={routes.MAIN} component={Main} />
    </Switch>
  </App>
);
