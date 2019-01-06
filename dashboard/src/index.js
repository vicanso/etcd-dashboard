import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { debounce } from 'lodash-es';
import 'antd/dist/antd.css';



import './index.css';
import App from './App';
import MainHeader from './MainHeader';
import EditConnection from './EditConnection';
import EtcdEditor from './EtcdEditor';
import * as serviceWorker from './serviceWorker';
import history from './history';
import bridge from './bridge';
import {
  RouteHome,
  RouteEditConnection,
  RouteEtcdEditor,
} from './router';

ReactDOM.render((
  <div>
  <MainHeader />
  <Router
    history={history}
  ><div>
    <Route
      path={RouteHome}
      component={App}
    />
    <Route
      path={RouteEditConnection}
      component={EditConnection}
    />
    <Route
      path={RouteEtcdEditor}
      component={EtcdEditor}
    />
  </div></Router>
  </div>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();


window.onresize = debounce(function() {
  bridge.SetWidowSize(window.outerWidth, window.outerHeight);
}, 3000);
