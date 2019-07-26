import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';
import routes from '../../constants/routes';
import Login from './Login';
import Register from './Register';
import Intro from './Intro';
import SeedGenerate from './SeedGenerate';
import SeedConfirm from './SeedConfirm';
import { isSettingUpNewAccount } from '../../selectors/account';

export default function Landing(props) {
  console.log(props);

  const complete = useSelector(
    state => state.account.landingComplete || isSettingUpNewAccount(state)
  );
  const { location } = props;

  return (
    <div>
      <h2>Landing</h2>
      <Link to={routes.MAIN}> Main</Link>
      <Link to={routes.LOGIN}> Login</Link>
      <Link to={routes.REGISTER}> Register</Link>
      <Link to={routes.INTRO}> Intro</Link>
      <Link to={routes.SEEDGENERATE}> SEEDGENERATE</Link>
      <Link to={routes.SEEDCONFIRM}> SEEDCONFIRM</Link>
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
    </div>
  );
}
