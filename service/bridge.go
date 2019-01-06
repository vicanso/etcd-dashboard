package service

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/etcd-io/etcd/clientv3"
	"github.com/vicanso/etcd-dashboard/etcd"
	"github.com/zserge/lorca"
)

// BridgeBind bridge bind
func BridgeBind(ui lorca.UI) {
	c := &Config{}
	ui.Bind("BConfigSet", c.Set)
	ui.Bind("BConfigGet", c.Get)
	ui.Bind("BInitEtcdClient", initEtcdClient)
	ui.Bind("BGetKeysWithPrefix", getKeysWithPrefix)
	ui.Bind("BGetValueByKey", getValueByKey)
	ui.Bind("BPutValueByKey", putValueByKey)
	ui.Bind("BDelValueByKey", delValueByKey)
}

func errorNotify(err error) {
	if err == nil {
		return
	}
	log.Printf("error:%v", err)
}

func initEtcdClient(name, config string) {
	c := clientv3.Config{}
	err := json.Unmarshal([]byte(config), &c)
	if err != nil {
		errorNotify(err)
		return
	}
	_, err = etcd.InitClient(name, c)
	fmt.Println(c)
	if err != nil {
		errorNotify(err)
	}
	return
}

func getKeysWithPrefix(name, prefix string) (keys []string, err error) {
	keys, err = etcd.GetKeys(name, prefix, &etcd.OpOptions{
		WithPrefix: true,
	})
	return
}

func getValueByKey(name, key string) (value string, err error) {
	resp, err := etcd.Get(name, key, nil)
	if err != nil {
		return
	}
	if len(resp.Kvs) != 0 {
		value = string(resp.Kvs[0].Value)
	}
	return
}

// putValueByKey put value by key
func putValueByKey(name, key, value string) (result string, err error) {
	_, err = etcd.Put(name, key, value, nil)
	result = "fail"
	if err != nil {
		return
	}
	result = "ok"
	return
}

// delValueByKey delete value by key
func delValueByKey(name, key string) (result string, err error) {
	_, err = etcd.Del(name, key, nil)
	result = "fail"
	if err != nil {
		return
	}
	result = "ok"
	return
}
