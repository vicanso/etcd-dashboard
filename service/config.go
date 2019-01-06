package service

import (
	"log"
	"os"
	"os/user"
	"path"
	"sync"
	"syscall"

	"github.com/spf13/viper"
)

const (
	app               = "etcd-dashboard"
	defaultConfig     = "default"
	defaultConfigType = "yml"
)

// 初始化配置
func init() {
	mask := syscall.Umask(0)
	defer syscall.Umask(mask)
	usr, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}
	d := path.Join(usr.HomeDir + "/." + app)
	os.Mkdir(d, 0700)
	file := d + "/" + defaultConfig + "." + defaultConfigType

	viper.SetConfigName(defaultConfig)
	viper.AddConfigPath(d)
	viper.SetConfigType(defaultConfigType)

	_, err = os.Stat(file)
	if err != nil {
		if os.IsNotExist(err) {
			_, err := os.Create(file)
			if err != nil {
				log.Fatal(err)
			}
			viper.SetDefault("width", 640)
			viper.SetDefault("height", 480)
			viper.WriteConfig()
		} else {
			log.Fatal(err)
		}
	}

	err = viper.ReadInConfig()
	if err != nil {
		log.Fatal(err)
	}
	return
}

type (
	// Config config
	Config struct {
		sync.Mutex
	}
)

// Set set the config value
func (c *Config) Set(key string, value interface{}) {
	c.Lock()
	defer c.Unlock()
	viper.Set(key, value)
	viper.WriteConfig()
}

// Get get the config value
func (c *Config) Get(key string) interface{} {
	c.Lock()
	defer c.Unlock()
	return viper.Get(key)
}
