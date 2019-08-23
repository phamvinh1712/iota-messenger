import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import routes from '../../constants/routes';
import Login from './Login';
import Register from './Register';
import Intro from './Intro';
import SeedGenerate from './SeedGenerate';
import SeedConfirm from './SeedConfirm';

export default function Landing(props) {
  const complete = useSelector(state => state.account.landingComplete);
  const { location } = props;

  return (
    <Switch>
      <Route path={routes.REGISTER} component={Register} />
      <Route path={routes.LOGIN} component={Login} />
      <Route path={routes.INTRO} component={Intro} />
      <Route path={routes.SEEDGENERATE} component={SeedGenerate} />
      <Route path={routes.SEEDCONFIRM} component={SeedConfirm} />
      <Route
        path={routes.LANDING}
        loop={false}
        component={complete ? Login : Intro}
      />
    </Switch>
  );
}
