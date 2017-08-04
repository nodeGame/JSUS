# JSUS: JavaScript UtilS.

[![Build Status](https://travis-ci.org/nodeGame/JSUS.png?branch=master)](https://travis-ci.org/nodeGame/JSUS)

Collection of general purpose javascript functions. JSUS helps!

## Libraries

1. OBJ
2. ARRAY
3. TIME
4. EVAL
5. DOM
6. RANDOM
7. PARSE
8. FS
9. COMPATIBILITY
10. QUEUE


All methods of all libraries are available directly as
JSUS.[methodName].

```javascript
JSUS.seq(1,10,2); // [ 1, 3, 5, 7, 9 ];
```

To get a copy of one of the registered JSUS libraries do:

```javascript
var ARRAY = JSUS.require('ARRAY');
ARRAY.seq(1,10,2); // [ 1, 3, 5, 7, 9 ];
```

## Browser

In the browser, two objects are exported: `JSUS` and its shorthand `J`.

## Full Documentation.

Full API description available [here](http://nodegame.github.io/JSUS/docs/jsus.js.html).

## Build

Create your customized build of JSUS.js using the make file in the bin directory

```javascript
node make.js build -a // Full build
node make.js build -l obj,array -o jsus-oa.js // Only object and array libs.
```


## API Documentation

Create html API documentation using the make file in the bin directory

```javascript
node make.js doc
```

## Make help

	Usage: make.jsus.js [options] [command]

  	Commands:

		build [options] [options]
		Creates a custom build of JSUS.js

    doc
    Build documentation files

	Options:

	-h, --help     output usage information
	-V, --version  output the version number


  Usage: build [options] [options]

  Options:

    -h, --help           output usage information
    -l, --lib <items>    choose libraries to include
    -A, --analyse        analyse build
    -a, --all            full build of JSUS
    -o, --output <file>

## License

[MIT](LICENSE)
