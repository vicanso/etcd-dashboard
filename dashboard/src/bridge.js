const ready = !!window["BConfigSet"];

const debug = function(...args) {
  console.info(...args)
}

const bridge = {
  SetWidowSize: async function(width, height) {
    if (!ready) {
      return;
    }
    window.BConfigSet("width", width);
    window.BConfigSet("height", height);
  },
  addConnection: async function(connection) {
    if (!ready) {
      return;
    }
    const found = await this.getConnection();
    if (!found) {
      throw new Error('The name is exists, please use update');
    }
    // const connections = await this.getConnections();
    // let found = null;
    // connections.forEach((item) => {
    //   if (item.name === connection.name) {
    //     found = item;
    //   }
    // });
    // if (found) {
    //   found = Object.assign(found, connection);
    // } else {
      // connections.push(connection);
    // }
    const connections = await this.getConnections(); 
    connections.push(connection);
    await window.BConfigSet("connections", JSON.stringify(connections));
  },
  getConnections: async function() {
    if (!ready) {
      return [];
    }
    const values = await window.BConfigGet("connections");
    if (!values) {
      return [];
    }
    const data = JSON.parse(values);
    debug("connections:", data);
    return data
  },
  getConnection: async function(name) {
    const connections = await this.getConnections(); 
    let found = null;
    connections.forEach((item) => {
      if (item.name === name) {
        found = item;
      }
    });
    return found;
  },
  initConnection: async function(name) {
    const found = await this.getConnection(name) ;
    if (!found) {
      throw new Error('can not find the config for the connection')
    }
    const config = {
      endpoints: found.endPoints.split(','),
    };
    if (found.username) {
      config.username = found.username;
      config.password = found.password;
    }
    await window.BInitEtcdClient(found.name, JSON.stringify(config));
  },
  getKeysWithPrefix: async function(name, prefix) {
    const keys = await window.BGetKeysWithPrefix(name, prefix);
    debug("keys:", keys);
    return keys
  },
  getValueByKey: async function(name, key) {
    const value = await window.BGetValueByKey(name, key);
    debug("get key: %s, value:%s", key, value);
    return value;
  },
  putValueByKey: async function(name, key, value) {
    await window.BPutValueByKey(name, key, value);
    debug("set key: %s, value:%s success", key, value);
  },
  delValueByKey: async function(name, key) {
    await window.BDelValueByKey(name, key);
    debug("del key: %s success", key);
  }
}

export default bridge;