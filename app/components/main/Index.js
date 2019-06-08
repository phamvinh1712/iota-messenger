import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';

type Props = {};

export default class Main extends React.PureComponent {
  props: Props;

  render() {
    return (
      <div>
        <h2>Main</h2>
        test main
        <Link to={routes.LANDING}> landing</Link>
      </div>
    );
  }
}
