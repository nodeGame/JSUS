# doc: 
#	@./node_modules/.bin/yuidoc . -c yuidoc.js

doc:
	@./node_modules/.bin/docker lib/ -o docs 



test:
	@./node_modules/.bin/mocha

.PHONY: test
