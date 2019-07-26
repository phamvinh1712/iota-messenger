// @flow
import React, { Component } from 'react';
import { Provider, type Store } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { BrowserRouter as Router } from 'react-router-dom';

import Routes from '../Routes';

type Props = {
  store: Store,
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </Provider>
    );
  }
}
