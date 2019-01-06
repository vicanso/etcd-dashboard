package etcd

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/etcd-io/etcd/clientv3"
)

const (
	defaultTimeout = 5 * time.Second
)

var (
	lock                = new(sync.Mutex)
	clients             = make(map[string]*clientv3.Client)
	errEndPointsIsEmpty = errors.New("end points is empty")
	errClientNotInit    = errors.New("client is not init")
)

type (
	// OpOptions op options
	OpOptions struct {
		WithPrefix  bool
		WithFromKey bool
		Sort        string
		Limit       int64
		LeaseID     int64
	}
)

// InitClient init etcd client
func InitClient(name string, conf clientv3.Config) (cli *clientv3.Client, err error) {
	lock.Lock()
	defer lock.Unlock()
	// 如果已有相同名字的已初始化，先关闭（因为有可能Config有所变化）
	cli = clients[name]
	if cli != nil {
		cli.Close()
	}
	delete(clients, name)

	if len(conf.Endpoints) == 0 {
		err = errEndPointsIsEmpty
		return
	}

	conf.DialTimeout = defaultTimeout

	cli, err = clientv3.New(conf)
	if cli != nil {
		clients[name] = cli
	}
	return
}

// GetClient get client
func GetClient(name string) (cli *clientv3.Client, err error) {
	lock.Lock()
	defer lock.Unlock()
	cli = clients[name]
	if cli == nil {
		err = errClientNotInit
	}
	return
}

// GetOps get query ops
func GetOps(params *OpOptions) (ops []clientv3.OpOption) {
	if params == nil {
		return
	}
	if params.WithPrefix {
		ops = append(ops, clientv3.WithPrefix())
	}
	if params.WithFromKey {
		ops = append(ops, clientv3.WithFromKey())
	}
	if params.Sort != "" {
		v := params.Sort
		order := clientv3.SortAscend
		if v[0] == '-' {
			order = clientv3.SortDescend
			v = v[1:]
		}
		var target clientv3.SortTarget
		switch v {
		case "version":
			target = clientv3.SortByVersion
		case "createRevision":
			target = clientv3.SortByCreateRevision
		case "modRevision":
			target = clientv3.SortByModRevision
		case "value":
			target = clientv3.SortByValue
		default:
			// key
			target = clientv3.SortByKey
		}
		ops = append(ops, clientv3.WithSort(target, order))
	}

	if params.Limit != 0 {
		ops = append(ops, clientv3.WithLimit(params.Limit))
	}
	if params.LeaseID != 0 {
		id := clientv3.LeaseID(params.LeaseID)
		ops = append(ops, clientv3.WithLease(id))
	}
	return
}

// GetKeys get the keys of etcd
func GetKeys(name, key string, params *OpOptions) (keys []string, err error) {
	cli, err := GetClient(name)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	ops := GetOps(params)
	ops = append(ops, clientv3.WithKeysOnly())
	fmt.Println(ops)
	fmt.Println(cli)

	resp, err := cli.Get(ctx, key, ops...)

	if err != nil {
		return
	}

	keys = make([]string, 0, resp.Count)
	for _, item := range resp.Kvs {
		keys = append(keys, string(item.Key))
	}
	return
}

// Count get the count of query
func Count(name, key string, params *OpOptions) (count int64, err error) {
	cli, err := GetClient(name)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	ops := GetOps(params)
	ops = append(ops, clientv3.WithCountOnly())
	resp, err := cli.Get(ctx, key, ops...)

	if err != nil {
		return
	}
	count = resp.Count
	return
}

// Put put the value to etcd
func Put(name, key, value string, params *OpOptions) (resp *clientv3.PutResponse, err error) {
	cli, err := GetClient(name)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()
	ops := GetOps(params)
	resp, err = cli.Put(ctx, key, value, ops...)
	return
}

// Get get the value from etcd
func Get(name, key string, params *OpOptions) (resp *clientv3.GetResponse, err error) {
	cli, err := GetClient(name)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()
	ops := GetOps(params)
	resp, err = cli.Get(ctx, key, ops...)
	return
}

// Del delete the key from etcd
func Del(name, key string, params *OpOptions) (resp *clientv3.DeleteResponse, err error) {
	cli, err := GetClient(name)
	if err != nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()
	ops := GetOps(params)
	resp, err = cli.Delete(ctx, key, ops...)
	return
}

// CloseAll close all client
func CloseAll() {
	lock.Lock()
	defer lock.Unlock()
	for _, c := range clients {
		c.Close()
	}
}
