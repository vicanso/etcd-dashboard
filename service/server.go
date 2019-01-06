package service

import (
	"log"
	"net"
	"os"

	"github.com/vicanso/cod"
)

// HTTPServe
func HTTPServe() string {
	if os.Getenv("GO_ENV") == "dev" {
		return "127.0.0.1:3000"
	}
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
	d := cod.New()
	go d.Serve(ln)
	return ln.Addr().String()
}
