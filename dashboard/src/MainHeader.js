import React, { Component } from 'react';
import { Menu, Icon, message } from 'antd';

import './MainHeader.css';
import history from './history';
import bridge from './bridge';
import {
  RouteEditConnection,
} from './router';

const {
  SubMenu,
} = Menu;

class MainHeader extends Component {
  state = {
    current: '',
    connections: [],
  }
  handleClick = (e) => {
    const {
      key,
    } = e;
    if (key === 'create') {
      history.push(RouteEditConnection, {
        type: 'create',
      });
    } else {
      history.push(RouteEditConnection, {
        type: 'edit',
        name: key,
      });

    }
    this.setState({
      current: key,
    });
  }
  async componentDidMount() {
    try {
      const connections = await bridge.getConnections();
      this.setState({
        connections,
      });
    } catch (err) {
      message.error(err.message);
    }
  }
  render() {
    return (
      <Menu
        className="MainHeader"
        mode="horizontal"
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
      >
        <Menu.Item key="create">
            <Icon type="plus-circle" />
            Create
        </Menu.Item>
        <SubMenu
          title={<span><Icon type="link" />Connect</span>}
        >
          {this.state.connections.map(item => (
            <Menu.Item
              key={item.name}
              title={item.endPoints}
            >
              {item.name}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    );
  }
}

export default MainHeader;