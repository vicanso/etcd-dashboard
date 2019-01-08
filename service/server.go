package service

import (
	"fmt"
	"log"
	"net"
	"os"

	"github.com/gobuffalo/packr"
	"github.com/vicanso/cod"
	"github.com/vicanso/cod/middleware"
)

var (
	box = packr.NewBox("../dashboard/build")
)

type (
	// StaticFiles static files
	StaticFiles struct {
		box *packr.Box
	}
)

// Exists check file exists
func (sf *StaticFiles) Exists(file string) bool {
	return sf.box.Has(file)
}

// Get get file content
func (sf *StaticFiles) Get(file string) ([]byte, error) {
	fmt.Println(file)
	return sf.box.Find(file)
	// return []byte(""), nil
}

// Stat get file info
func (sf *StaticFiles) Stat(file string) os.FileInfo {
	return nil
}

// HTTPServe http serve
func HTTPServe() string {
	if os.Getenv("GO_ENV") == "dev" {
		return "127.0.0.1:3000"
	}
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	d := cod.New()
	d.Use(middleware.NewResponder(middleware.ResponderConfig{}))

	d.GET("/static/*file", middleware.NewStaticServe(&StaticFiles{
		box: &box,
	}, middleware.StaticServeConfig{
		Path: "/",
	}), func(c *cod.Context) error {
		return nil
	})

	d.GET("/", func(c *cod.Context) (err error) {
		buf, err := box.Find("index.html")
		if err != nil {
			return err
		}
		c.SetHeader(cod.HeaderContentType, "text/html")
		fmt.Println(string(buf))
		c.Body = buf
		return
	})
	go func() {
		defer ln.Close()
		err = d.Serve(ln)
		if err != nil {
			log.Fatal(err)
		}
	}()
	return ln.Addr().String()
}
