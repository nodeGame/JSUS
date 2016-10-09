doc:
	@./node_modules/.bin/docker lib/ -o docs -s true

build:
	@./bin/make.jsus.js

publish:
	node bin/make.js build -a && npm publish

test:
	@./node_modules/.bin/mocha

.PHONY: test
