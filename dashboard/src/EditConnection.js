import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';

import './EditConnection.css';
import bridge from './bridge';
import history from './history';
import {
  RouteEtcdEditor,
} from './router';

const ADD_MODE = "add";
const EDIT_MODE = "edit";

class EditConnection extends Component {
  state = {
    title: '',
    type: '',
    name: '',
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.error("please input the valid field value");
        return;
      }
      bridge.addConnection(values).then(() => {
        message.info("add connection success");
      }).catch((err) => {
        message.error(err.message);
      });
    });
  }
  componentWillUnmount() {
    this.removeListen();
  }
  async updateState() {
    const {
      state,
    } = history.location;
    let title = 'Add etcd connection';
    let type = ADD_MODE;
    const {
      setFieldsValue,
    } = this.props.form;
    let name = '';
    if (state && state.type === EDIT_MODE) {
      title = 'Update etcd connection';
      type = state.type;
      name = state.name;
      const values = {
        name,
        endPoints: '',
        password: '',
        username: '',
      };
      try {
        const found = await bridge.getConnection(name)
        Object.assign(values, found);
        setFieldsValue(values);
      } catch (err) {
        message.error(err);
      }
    }
    this.setState({
      mode: type, 
      name,
      title,
    });
  }
  onConnect() {
    const {
      name,
    } = this.state;
    history.push(RouteEtcdEditor, {
      name,
    });
  }
  componentWillMount() {
    this.removeListen = history.listen((location) => {
      this.updateState();
    });
    this.updateState();
  }
  render() {
    const {
      title,
      mode,
    } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const iconStyle = {
      color: 'rgba(0,0,0,.25)',
    };
    const { getFieldDecorator } = this.props.form;

    const btnList = [];
    if (mode === EDIT_MODE) {
      btnList.push(<Button
        onClick={() => this.onConnect()}
        type="primary"
        htmlType="submit" className="edit-connection-form-button">
        Connect
      </Button>);
      btnList.push(<Button
        htmlType="submit" className="edit-connection-form-button">
        Update 
      </Button>);
    } else {
      btnList.push(<Button
        type="primary"
        htmlType="submit" className="edit-connection-form-button">
        Create
      </Button>);
    }

    // {connectBtn}
    // 


    return (
      <div
        className="edit-connection-form"
      >
        <h3
          className="edit-connection-form-title"
        >{title}</h3>
        <Form
          onSubmit={this.handleSubmit}
        >
          <Form.Item
            {...formItemLayout}
            label="Name"
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: 'Please input the name of the etcd!',
              }],
            })(
              <Input
                placeholder="etcd name"
                prefix={<Icon type="tag" style={iconStyle} />}
              />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="EndPoints"
          >
            {getFieldDecorator('endPoints', {
              rules: [{
                required: true, message: 'Please input the end points of the etcd!',
              }],
            })(
              <Input
                prefix={<Icon type="database" style={iconStyle} />}
                placeholder="127.0.0.1:2379,127.0.0.1:3379"
              />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Username"
          >
            {getFieldDecorator('username', {
              rules: [],
            })(
              <Input
                prefix={<Icon type="user" style={iconStyle} />}
                placeholder="username of etcd"
              />
            )}
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="Password"
          >
            {getFieldDecorator('password', {
              rules: [],
            })(
              <Input
                type="password"
                prefix={<Icon type="lock" style={iconStyle} />}
                placeholder="password of etcd"
              />
            )}
   
          </Form.Item>
          {btnList}
        </Form>
      </div>
    );
  }
}

export default Form.create()(EditConnection);
