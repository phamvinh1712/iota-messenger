import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes';

export default function Register() {
  return (
    <div>
      <h2>Register</h2>
      <Link to={routes.MAIN}> Main</Link>
      <div>test</div>
    </div>
  );
}
