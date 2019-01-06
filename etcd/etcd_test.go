package etcd

import (
	"math/rand"
	"testing"
	"time"

	"github.com/etcd-io/etcd/clientv3"
)

const (
	clientName = "test"
	randomSize = 100
)

var letterRunes = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")

// randomString get random string
func randomString(n int) string {
	b := make([]rune, n)
	rand.Seed(time.Now().UnixNano())
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

func TestInitClient(t *testing.T) {
	cli, err := InitClient(clientName, clientv3.Config{
		Endpoints: []string{
			"127.0.0.1:2379",
		},
	})
	if err != nil || cli == nil {
		t.Fatalf("init client fail, %v", err)
	}
}

func TestPut(t *testing.T) {
	for index := 0; index < randomSize; index++ {
		k := randomString(16)
		v := randomString(32)
		_, err := Put(clientName, k, v, nil)
		if err != nil {
			t.Fatalf("put random value fail, %v", err)
		}
	}
}

func TestCount(t *testing.T) {
	count, err := Count(clientName, "", &OpOptions{
		WithPrefix: true,
	})
	if err != nil {
		t.Fatalf("count fail, %v", err)
	}
	if count < randomSize {
		t.Fatalf("get count fail")
	}
}

func TestGetKeys(t *testing.T) {
	keys, err := GetKeys(clientName, "", &OpOptions{
		WithPrefix: true,
	})
	if err != nil {
		t.Fatalf("get keys fail, %v", err)
	}
	if len(keys) < randomSize {
		t.Fatalf("get keys fail")
	}
}
