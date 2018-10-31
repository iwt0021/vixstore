import React from 'react';
import ReactDOM from 'react-dom';
import {Navigator} from 'react-onsenui';

import SelectPhotoPage from './SelectPhotoPage';

export default class App extends React.Component {

  constructor(props) {
    super(props);

    document.addEventListener("deviceready", this.onDeviceReady, false);
  }

  onDeviceReady() {
    console.log("deviceready");
  }

  renderPage(route, navigator) {
    const props = route.props || {};
    props.navigator = navigator;

    return React.createElement(route.component, props);
  }

  render() {
    return (
      <Navigator initialRoute={{component: SelectPhotoPage}} renderPage={this.renderPage} />
    );
  }
}