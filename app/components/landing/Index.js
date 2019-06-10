import React from 'react';
import { Link,Route,Switch } from 'react-router-dom';
import routes from '../../constants/routes';
import Login from './Login';
import Register from './Register';
import Intro from './Intro';

import Main from '../main';

export default function Landing(props) {
  console.log(props);
  const {location} = props;
  return (
    <div>
      <h2>Landing</h2>
      <Link to={routes.MAIN}> Main</Link>
      <Link to={routes.LOGIN}> Login</Link>
      <Link to={routes.REGISTER}> Register</Link>

      <Switch>
        <Route path={routes.REGISTER} component={Register} />
        <Route path={routes.LOGIN} component={Login} />
        <Route exact component={Intro} />
      </Switch>
    </div>
  );
}
