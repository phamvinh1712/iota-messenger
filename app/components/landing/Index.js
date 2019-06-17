import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import routes from '../../constants/routes';
import styles from './landingStyle';
import Login from './Login';
import Register from './Register';
import Intro from './Intro';
import SeedGenerate from './SeedGenerate';
import SeedConfirm from './SeedConfirm';

export default function Landing(props) {
  console.log(props);
  const classes = styles();
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
        <Route
          path={routes.REGISTER}
          render={() => <Register classes={classes} />}
        />
        <Route path={routes.LOGIN} render={() => <Login classes={classes} />} />
        <Route path={routes.INTRO} render={() => <Intro classes={classes} />} />
        <Route
          path={routes.SEEDGENERATE}
          render={() => <SeedGenerate classes={classes} />}
        />
        <Route
          path={routes.SEEDCONFIRM}
          render={() => <SeedConfirm classes={classes} />}
        />
      </Switch>
    </div>
  );
}
