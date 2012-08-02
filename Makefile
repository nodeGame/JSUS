doc:
	@./node_modules/.bin/docker lib/ -o docs -s true

build:
	@./bin/make.jsus.js

test:
	@./node_modules/.bin/mocha

.PHONY: test
