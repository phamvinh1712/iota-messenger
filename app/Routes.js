import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import routes from './constants/routes';
import App from './containers/App';
import Landing from './components/landing/Index';
import Main from './components/main/Index';

export default () => (
  <App>
    test
    <Link to={routes.MAIN}> Main</Link>
    <Link to={routes.LANDING}> LANDING</Link>
    <Switch>
      <Route path={routes.LANDING} component={Landing} />
      <Route path={routes.MAIN} component={Main} />
    </Switch>
  </App>
);
