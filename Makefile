# doc: 
#	@./node_modules/.bin/yuidoc . -c yuidoc.js

doc:
	@./node_modules/.bin/docker jsus.js lib/ -o docs 



test:
	@./node_modules/.bin/mocha

.PHONY: test
