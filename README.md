# JSUS: JavaScript UtilS. 

Collection of general purpose javascript functions. JSUS helps!

## Usage

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

### JSUS come shipped in with a set of default libraries:

1. OBJ
2. ARRAY
3. TIME
4. EVAL
5. DOM
6. RANDOM
7. PARSE
8. FS

## Build

Create your customized build of JSUS.js using the make file in the bin directory

```javascript
node make.js build -a // Full build, about 20Kb minified
node make.js build -l obj,array -o jsus-oa.js // about 12Kb minified
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

Copyright (C) 2012 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

