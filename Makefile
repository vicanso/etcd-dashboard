.PHONY: default test test-cover dev

default: dev

# for dev
dev: export GO_ENV=dev
dev:
	fresh

# for test
test:
	go test -race -cover ./...

test-cover:
	go test -race -coverprofile=test.out ./... && go tool cover --html=test.out

build:
	cd dashboard && yarn build
	packr -z

