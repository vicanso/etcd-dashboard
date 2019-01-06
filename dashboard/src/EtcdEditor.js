import React, { Component } from 'react';
import { message, List, Input, Select, Button, Spin, Modal, Popconfirm } from 'antd';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/yaml/yaml.js';

import './EtcdEditor.css';

import history from './history';
import bridge from './bridge';
import {
  RouteHome,
} from './router';

const {
  Search,
} = Input;
const {
  Option,
} = Select;

class EtcdEditor extends Component {
  state = {
    limit: 100,
    name: '',
    keys: [],
    selectedKey: '',
    loading: false,
    spinTips: '',
    showAddModal: false,
    inputKey: '',
  }
  editorRef = React.createRef()
  editor = null
  async fetchKeys(prefix) {
    const {
      name,
    } = this.state;
    if (!prefix) {
      this.setState({
        keys: [],
      });
      return;
    }
    
    try {
      this.setState({
        loading: true,
      });
      await bridge.initConnection(name);
      const keys = await bridge.getKeysWithPrefix(name, prefix);
      this.setState({
        keys: keys,
      });
    } catch (err) {
      message.error(err.message || err);
    } finally {
      this.setState({
        loading: false,
      });
    }
  }
  async componentDidMount() {
    const {
      state,
    } = history.location;
    if (!state || !state.name) {
      history.push(RouteHome)
      return
    }
    this.setState({
      name: state.name,
    });
    this.editor = CodeMirror.fromTextArea(this.editorRef.current, {
      lineNumbers: true,
      theme: 'monokai',
      mode: 'javascript',
    });
  }
  async onShowValue(key) {
    const {
      name,
    } = this.state;
    try {
      this.setState({
        spinTips: 'loading...',
      });
      const value = await bridge.getValueByKey(name, key);
      this.editor.doc.setValue(value);
      this.setState({
        selectedKey: key,
      });
    } catch (err) {
      message.error(err);
    } finally {
      this.setState({
        spinTips: '',
      });
    }
  }
  changeEditorMode(value) {
    this.editor.setOption('mode', value);
  }
  onSearch(value) {
    this.fetchKeys(value);
  }
  async onUpdate() {
    const {
      name,
      selectedKey,
    } = this.state;
    const value = this.editor.doc.getValue();
    try {
      this.setState({
        spinTips: 'Submitting...',
      });
      await bridge.putValueByKey(name, selectedKey, value);
      message.success(`update ${selectedKey} success`);
    } catch (err) {
      message.error(err)
    } finally {
      this.setState({
        spinTips: '',
      });
    }
  }
  updateInputKey(e) {
    this.setState({
      inputKey: e.target.value,
    });
  }
  async onAdd() {
    const {
      name,
      inputKey,
    } = this.state;
    const value = this.editor.doc.getValue();
    if (!value || !inputKey) {
      message.error('key and value can not be null')
      return
    }
    try {
      this.setState({
        showAddModal: false,
        spinTips: 'Submitting...',
      });
      await bridge.putValueByKey(name, inputKey, value);
    } catch (err) {
      message.error(err);
    } finally {
      this.setState({
        spinTips: '',
      });
    }
  }
  async onDel() {
    const {
      name,
      selectedKey,
      keys,
    } = this.state;
    try {
      this.setState({
        spinTips: 'Deleting...',
      });
      await bridge.delValueByKey(name, selectedKey);
      this.setState({
        keys: keys.filter(item => item !== selectedKey),
      });
      this.editor.doc.setValue("");
    } catch (err) {
      message.error(err);
    } finally {
      this.setState({
        spinTips: '',
      });
    }
  }
  render() {
    const {
      keys,
      loading,
      selectedKey,
      spinTips,
      showAddModal,
    } = this.state;
    const spin = (
      !!spinTips ? (<Spin
        className="etcd-editor-spin"
        tip={spinTips}
      />) : null
    );
    return (
      <div
        className="etcd-editor"
      >
        <Modal
          title="Are you want to add the key?"
          centered
          visible={showAddModal}
          onCancel={() => this.setState({
            showAddModal: false,
          })}
          onOk={() => this.onAdd()}
        >
          <Input
            addonBefore="key"
            placeholder="please input the key you want to add"
            value={this.state.inputKey}
            onChange={e => this.updateInputKey(e)}
          />
        </Modal>
        {spin}
        <div
          className="etcd-editor-keys full-height"
        >
          <div
            className="etcd-editor-search"
          >
            <Search
              placeholder="input prefix of key"
              onSearch={value => this.onSearch(value)}
              enterButton
            />
          </div>
          <List
            className="full-height-scroll"
            loading={loading}
            itemLayout="horizontal"
            dataSource={keys}
            renderItem={item => (
              <List.Item
                className={{
                  "selected": selectedKey === item,
                }}
              >
                <span
                  onClick={() => this.onShowValue(item)}
                >{item}</span>
              </List.Item>
            )}
          />
        </div>
        <div
          className="etcd-editor-value"
        >
          <div className="etcd-editor-functions">
            <span>Format as: </span>
            <Select
              style={{
                width: 120,
              }}
              defaultValue="json"
              onChange={value => this.changeEditorMode(value)}
            >
              <Option value="json">json</Option>
              <Option value="yaml">yaml</Option>
            </Select>
            <Button
              type="primary"
              icon="edit"
              disabled={selectedKey === ''}
              onClick={() => this.onUpdate()}
            >Update</Button>
            <Button
              onClick={() => this.setState({
                showAddModal: true,
                inputKey: '',
              })}
              icon="plus-circle"
            >Add</Button>
            <Popconfirm
              title="Are you sure delete this key?"
              onConfirm={() => this.onDel()}
            >
              <Button
                type="primary"
                icon="close-circle"
                disabled={selectedKey === ''}
              >
                Delete
              </Button> 
            </Popconfirm>
      
          </div>
          <textarea
            ref={this.editorRef}
          ></textarea>
        </div>
      </div>
    );
  }
}

export default EtcdEditor;
