# JSUS: JavaScript UtilS. 

Collection of general purpose javascript functions. JSUS helps!


## Build

Create your customized build of JSUS.js 


	Usage: make.jsus.js [options] [command]

  	Commands:

		build [options] 
		Creates a custom build of JSUS.js

	Options:

	-h, --help     output usage information
	-V, --version  output the version number

  	Usage: build [options]

	Options:

	-h, --help           output usage information
	-o, --output <file>


```javascript
	node make.jsus.js build // Full build, about 16Kb minified
	node make.jsus.js build OBJ ARRAY -o jsus-oa.js // about 8Kb minified
```

## License

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

