package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"runtime"

	"github.com/spf13/viper"
	"github.com/zserge/lorca"

	service "github.com/vicanso/etcd-dashboard/service"
)

func main() {

	args := []string{}
	if runtime.GOOS == "linux" {
		args = append(args, "--class=Lorca")
	}
	width := viper.GetInt("width")
	height := viper.GetInt("height")
	url := fmt.Sprintf("http://%s/", service.HTTPServe())
	ui, err := lorca.New(url, "", width, height, args...)
	if err != nil {
		log.Fatalln(err)
	}
	// 函数绑定
	service.BridgeBind(ui)

	// Wait until the interrupt signal arrives or browser window is closed
	sig := make(chan os.Signal)
	signal.Notify(sig, os.Interrupt)
	select {
	case <-sig:
	case <-ui.Done():
	}

	log.Println("exiting...")
}
