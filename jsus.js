(function (exports) {
	
	/**
	 * JSUS: JavaScript UtilS. 
	 * Copyright(c) 2012 Stefano Balietti
	 * MIT Licensed
	 * 
	 * Collection of general purpose javascript functions. JSUS helps!
	 * 
	 * JSUS is designed to be modular and easy to extend. 
	 * 
	 * Just use: 
	 * 
	 * 		JSUS.extend(myClass);
	 * 
	 * to extend the functionalities of JSUS. All the methods of myClass 
	 * are immediately added to JSUS, and a reference to myClass is stored
	 * in JSUS._classes.
	 * 
	 * MyClass can be either of type Object or Function.
	 * 
	 * JSUS can also extend other objects. Just pass a second parameter:
	 * 
	 * 
	 * 		JSUS.extend(myClass, mySecondClass);
	 * 
	 * and mySecondClass will receive all the methods of myClass. In this case,
	 * no reference of myClass is stored.
	 * 
	 * JSUS come shipped in with a default set of libraries:
	 * 
	 * 		1. OBJ
	 * 		2. ARRAY
	 * 		3. TIME
	 * 		4. EVAL
	 * 		5. DOM
	 * 		6. RANDOM
	 * 
	 * Extra help is supplied inside each library file.
	 * 
	 */
	var JSUS = exports.JSUS = {};
	
	// Reference to all the extensions
	JSUS._classes = {};
	
	/**
	 * Reference to standard out, by default console.log
	 * 
	 * Overridde to redirect the starndard output of all JSUS functions.
	 */
	JSUS.log = function (txt) {
		console.log(txt);
	};
	
	/**
	 * Extends JSUS with additional methods and or properties taken 
	 * from the object passed as first parameter. 
	 * 
	 * The first parameter can be an object literal or a function.
	 * A reference of the original extending object is stored in 
	 * JSUS._classes
	 * 
	 * If a second parameter is passed, that will be the target of the
	 * extension.
	 * 
	 */
	JSUS.extend = function (additional, target) {		
		if ('object' !== typeof additional && 'function' !== typeof additional) {
			return target;
		}
		
		// If we are extending JSUS, store a reference
		// of the additional object into the hidden
		// JSUS._classes object;
		if ('undefined' === typeof target) {
			var target = target || this;
			if ('function' === typeof additional) {
				var name = additional.toString();
				name = name.substr('function '.length);
				name = name.substr(0, name.indexOf('('));
			}
			// must be object
			else {
				var name = additional.constructor || additional.__proto__.constructor;
			}
			if (name) {
				this._classes[name] = additional;
			}
		}
		
	    for (var prop in additional) {
	      if (additional.hasOwnProperty(prop)) {
	        if (typeof target[prop] !== 'object') {
	        	target[prop] = additional[prop];
	        } else {
	          JSUS.extend(additional[prop], target[prop]);
	        }
	      }
	    }

	    // additional is a class (Function)
	    // TODO: this is true also for {}
	    if (additional.prototype) {
	    	JSUS.extend(additional.prototype, target.prototype || target);
	    };
		
	    return target;
	  };
	  
	  // if node
	  if ('object' === typeof module && 'function' === typeof require) {
		  require('./lib/obj');
		  require('./lib/array');
		  require('./lib/time');
		  require('./lib/eval');
		  require('./lib/dom');
		  require('./lib/random');
	  }
	  // end node
	  
	  /**
	   * Returns a copy of one / all the objects that have extended the
	   * current instance of JSUS.
	   * 
	   * The first parameter is a string representation of the name of 
	   * the requested extending object. If no parameter is passed a copy 
	   * of all the extending objects is returned.
	   * 
	   * 
	   */
	  JSUS.get = function (className) {
		  if ('undefined' === typeof JSUS.clone) {
			  JSUS.log('JSUS.clone not found. Cannot continue.');
			  return false;
		  }
		  if ('undefined' === typeof className) return JSUS.clone(JSUS._classes);
		  if ('undefined' === typeof JSUS._classes[className]) {
			  JSUS.log('Could not find class ' + className);
			  return false;
		  }
		  return JSUS.clone(JSUS._classes[className]);
	  };


	
})('undefined' !== typeof module && 'undefined' !== typeof module.exports ? module.exports: window);

