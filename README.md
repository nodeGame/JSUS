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
8. FS (+wrench)
9. COMPATIBILITY
10. QUEUE

Full API description available [here](http://nodegame.github.io/JSUS/docs/jsus.js.html).

## Build

Create your customized build of JSUS.js using the make file in the bin directory

```javascript
node make.js build -a // Full build, about 20Kb minified
node make.js build -l obj,array -o jsus-oa.js // about 12Kb minified
```

## Extend

JSUS is designed to be modular and easy to extend.

Just use:

```javascript
JSUS.extend(myClass);
```

to extend the functionalities of JSUS. All the methods of myClass
are immediately added to JSUS, and a reference to myClass is stored
in `JSUS._classes`.

`MyClass` can be either of type Object or Function.

JSUS can also extend other objects. Just pass a second parameter:

```javascript
JSUS.extend(myClass, mySecondClass);
```

and `mySecondClass` will receive all the methods of `myClass`. In this case,
no reference of myClass is stored.

To get a copy of one of the registered JSUS libraries do:

```javascript
var myClass = JSUS.require('myClass');
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
