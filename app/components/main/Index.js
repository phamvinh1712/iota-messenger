import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';

export default function Main() {
  return (
    <div>
      <h2>Main</h2>
      test main
      <Link to={routes.LANDING}> landing</Link>
    </div>
  );
}
