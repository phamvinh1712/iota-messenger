import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';

type Props = {};

export default class Landing extends React.PureComponent {
  props: Props;

  render() {
    return (
      <div>
        <h2>Landing</h2>
        <Link to={routes.MAIN}> Main</Link>
      </div>
    );
  }
}
