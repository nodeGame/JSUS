/**
 * # JSUS: JavaScript UtilS.
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Collection of general purpose javascript functions. JSUS helps!
 *
 * See README.md for extra help.
 * ---
 */
(function(exports) {

    var JSUS = exports.JSUS = {};

    // ## JSUS._classes
    // Reference to all the extensions
    JSUS._classes = {};

    // Make sure that the console is available also in old browser, e.g. < IE8.
    if ('undefined' === typeof console) console = {};
    if ('undefined' === typeof console.log) console.log = function() {};

    /**
     * ## JSUS.log
     *
     * Reference to standard out, by default `console.log`
     *
     * Override to redirect the standard output of all JSUS functions.
     *
     * @param {string} txt Text to output
     */
    JSUS.log = function(txt) { console.log(txt); };

    /**
     * ## JSUS.extend
     *
     * Extends JSUS with additional methods and or properties
     *
     * The first parameter can be an object literal or a function.
     * A reference of the original extending object is stored in
     * JSUS._classes
     *
     * If a second parameter is passed, that will be the target of the
     * extension.
     *
     * @param {object} additional Text to output
     * @param {object|function} target The object to extend
     *
     * @return {object|function} target The extended object
     */
    JSUS.extend = function(additional, target) {
        var name, prop;
        if ('object' !== typeof additional &&
            'function' !== typeof additional) {
            return target;
        }

        // If we are extending JSUS, store a reference
        // of the additional object into the hidden
        // JSUS._classes object;
        if ('undefined' === typeof target) {
            target = target || this;
            if ('function' === typeof additional) {
                name = additional.toString();
                name = name.substr('function '.length);
                name = name.substr(0, name.indexOf('('));
            }
            // Must be object.
            else {
                name = additional.constructor ||
                    additional.__proto__.constructor;
            }
            if (name) {
                this._classes[name] = additional;
            }
        }

        for (prop in additional) {
            if (additional.hasOwnProperty(prop)) {
                if (typeof target[prop] !== 'object') {
                    target[prop] = additional[prop];
                } else {
                    JSUS.extend(additional[prop], target[prop]);
                }
            }
        }

        // Additional is a class (Function)
        // TODO: this is true also for {}
        if (additional.prototype) {
            JSUS.extend(additional.prototype, target.prototype || target);
        }

        return target;
    };

    /**
     * ## JSUS.require
     *
     * Returns a copy/reference of one/all the JSUS components
     *
     * @param {string} component The name of the requested JSUS library.
     *   If undefined, all JSUS components are returned. Default: undefined.
     * @param {boolean} clone Optional. If TRUE, the requested component
     *   is cloned before being returned. Default: TRUE
     *
     * @return {function|boolean} The copy of the JSUS component, or
     *   FALSE if the library does not exist, or cloning is not possible
     */
    JSUS.require = function(component, clone) {
        var out;
        clone = 'undefined' === typeof clone ? true : clone;
        if (clone && 'undefined' === typeof JSUS.clone) {
            JSUS.log('JSUS.require: JSUS.clone not found, but clone ' +
                     'requested. Cannot continue.');
            return false;
        }
        if ('undefined' === typeof component) {
            out = JSUS._classes;
        }
        else {
            out = JSUS._classes[component]
            if ('undefined' === typeof out) {
                JSUS.log('JSUS.require: could not find component ' + component);
                return false;
            }
        }
        return clone ? JSUS.clone(out) : out;
    };

    /**
     * ## JSUS.isNodeJS
     *
     * Returns TRUE when executed inside Node.JS environment
     *
     * @return {boolean} TRUE when executed inside Node.JS environment
     */
    JSUS.isNodeJS = function() {
        return 'undefined' !== typeof module &&
            'undefined' !== typeof module.exports &&
            'function' === typeof require;
    };

    // ## Node.JS includes
    if (JSUS.isNodeJS()) {
        require('./lib/compatibility');
        require('./lib/obj');
        require('./lib/array');
        require('./lib/time');
        require('./lib/eval');
        require('./lib/dom');
        require('./lib/random');
        require('./lib/parse');
        require('./lib/queue');
        require('./lib/fs');
    }
    else {
        // Exports J in the browser.
        exports.J = exports.JSUS;
    }

})(
    'undefined' !== typeof module && 'undefined' !== typeof module.exports ?
        module.exports: window
);

/**
 * # ARRAY
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Collection of static functions to manipulate arrays
 */
(function(JSUS) {

    "use strict";

    function ARRAY() {}

    /**
     * ## ARRAY.filter
     *
     * Add the filter method to ARRAY objects in case the method is not
     * supported natively.
     *
     * @see https://developer.mozilla.org/en/JavaScript/Reference/
     *              Global_Objects/ARRAY/filter
     */
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(fun /*, thisp */) {
            if (this === void 0 || this === null) throw new TypeError();

            var t = new Object(this);
            var len = t.length >>> 0;
            if (typeof fun !== "function") throw new TypeError();

            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, t)) {
                        res.push(val);
                    }
                }
            }
            return res;
        };
    }

    /**
     * ## ARRAY.isArray
     *
     * Returns TRUE if a variable is an Array
     *
     * This method is exactly the same as `Array.isArray`,
     * but it works on a larger share of browsers.
     *
     * @param {object} o The variable to check.
     *
     * @see Array.isArray
     */
    ARRAY.isArray = (function(f) {
        if ('function' === typeof f) return f;
        else return function(o) {
            if (!o) return false;
            return Object.prototype.toString.call(o) === '[object Array]';
        };
    })(Array.isArray);

    /**
     * ## ARRAY.seq
     *
     * Returns an array of sequential numbers from start to end
     *
     * If start > end the series goes backward.
     *
     * The distance between two subsequent numbers can be controlled
     * by the increment parameter.
     *
     * When increment is not a divider of Abs(start - end), end will
     * be missing from the series.
     *
     * A callback function to apply to each element of the sequence
     * can be passed as fourth parameter.
     *
     * Returns FALSE, in case parameters are incorrectly specified
     *
     * @param {number} start The first element of the sequence
     * @param {number} end The last element of the sequence
     * @param {number} increment Optional. The increment between two
     *   subsequents element of the sequence
     * @param {Function} func Optional. A callback function that can modify
     *   each number of the sequence before returning it
     *
     * @return {array} The final sequence
     */
    ARRAY.seq = function(start, end, increment, func) {
        var i, out;
        if ('number' !== typeof start) return false;
        if (start === Infinity) return false;
        if ('number' !== typeof end) return false;
        if (end === Infinity) return false;
        if (start === end) return [start];

        if (increment === 0) return false;
        if (!JSUS.inArray(typeof increment, ['undefined', 'number'])) {
            return false;
        }

        increment = increment || 1;
        func = func || function(e) {return e;};

        i = start;
        out = [];

        if (start < end) {
            while (i <= end) {
                out.push(func(i));
                i = i + increment;
            }
        }
        else {
            while (i >= end) {
                out.push(func(i));
                i = i - increment;
            }
        }

        return out;
    };

    /**
     * ## ARRAY.each
     *
     * Executes a callback on each element of the array
     *
     * If an error occurs returns FALSE.
     *
     * @param {array} array The array to loop in
     * @param {Function} cb The callback for each element in the array
     * @param {object} context Optional. The context of execution of the
     *   callback. Defaults ARRAY.each
     *
     * @return {boolean} TRUE, if execution was successful
     */
    ARRAY.each = function(array, cb, context) {
        var i, len;
        if ('object' !== typeof array) {
            throw new TypeError('ARRAY.each: array must be object. Found: ' +
                                array);
        }
        if ('function' !== typeof cb) {
            throw new TypeError('ARRAY.each: cb must be function. Found: ' +
                                cb);
        }

        context = context || this;
        len = array.length;
        for (i = 0 ; i < len; i++) {
            cb.call(context, array[i]);
        }
        return true;
    };

    /**
     * ## ARRAY.map
     *
     * Executes a callback to each element of the array and returns the result
     *
     * Any number of additional parameters can be passed after the
     * callback function.
     *
     * @return {array} The result of the mapping execution
     *
     * @see ARRAY.each
     */
    ARRAY.map = function() {
        var i, len, args, out, o;
        var array, func;

        array = arguments[0];
        func = arguments[1];

        if (!ARRAY.isArray(array)) {
            JSUS.log('ARRAY.map: first parameter must be array. Found: ' +
                     array);
            return;
        }
        if ('function' !== typeof func) {
            JSUS.log('ARRAY.map: second parameter must be function. Found: ' +
                     func);
            return;
        }

        len = arguments.length;
        if (len === 3) args = [ null, arguments[2] ];
        else if (len === 4) args = [ null, arguments[2], arguments[3] ];
        else {
            len = len - 1;
            args = new Array(len);
            for (i = 1; i < (len); i++) {
                args[i] = arguments[i+1];
            }
        }

        out = [], len = array.length;
        for (i = 0; i < len; i++) {
            args[0] = array[i];
            o = func.apply(this, args);
            if ('undefined' !== typeof o) out.push(o);
        }
        return out;
    };


    /**
     * ## ARRAY.removeElement
     *
     * Removes an element from the the array, and returns it
     *
     * For objects, deep equality comparison is performed
     * through JSUS.equals.
     *
     * If no element is removed returns FALSE.
     *
     * @param {mixed} needle The element to search in the array
     * @param {array} haystack The array to search in
     *
     * @return {mixed} The element that was removed, FALSE if none was removed
     *
     * @see JSUS.equals
     */
    ARRAY.removeElement = function(needle, haystack) {
        var func, i;
        if ('undefined' === typeof needle || !haystack) return false;

        if ('object' === typeof needle) {
            func = JSUS.equals;
        }
        else {
            func = function(a, b) {
                return (a === b);
            };
        }

        for (i = 0; i < haystack.length; i++) {
            if (func(needle, haystack[i])){
                return haystack.splice(i,1);
            }
        }
        return false;
    };

    /**
     * ## ARRAY.inArray
     *
     * Returns TRUE if the element is contained in the array,
     * FALSE otherwise
     *
     * For objects, deep equality comparison is performed
     * through JSUS.equals.
     *
     * @param {mixed} needle The element to search in the array
     * @param {array} haystack The array to search in
     *
     * @return {boolean} TRUE, if the element is contained in the array
     *
     * @see JSUS.equals
     */
    ARRAY.inArray = function(needle, haystack) {
        var func, i, len;
        if (!haystack) return false;
        func = JSUS.equals;
        len = haystack.length;
        for (i = 0; i < len; i++) {
            if (func.call(this, needle, haystack[i])) {
                return true;
            }
        }
        return false;
    };

    ARRAY.in_array = function(needle, haystack) {
        console.log('***ARRAY.in_array is deprecated. ' +
                    'Use ARRAY.inArray instead.***');
        return ARRAY.inArray(needle, haystack);
    };

    /**
     * ## ARRAY.getNGroups
     *
     * Returns an array of N array containing the same number of elements
     * If the length of the array and the desired number of elements per group
     * are not multiple, the last group could have less elements
     *
     * The original array is not modified.
     *
     *  @see ARRAY.getGroupsSizeN
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     *
     * @param {array} array The array to split in subgroups
     * @param {number} N The number of subgroups
     *
     * @return {array} Array containing N groups
     */
    ARRAY.getNGroups = function(array, N) {
        return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
    };

    /**
     * ## ARRAY.getGroupsSizeN
     *
     * Returns an array of arrays containing N elements each
     *
     * The last group could have less elements
     *
     * @param {array} array The array to split in subgroups
     * @param {number} N The number of elements in each subgroup
     *
     * @return {array} Array containing groups of size N
     *
     * @see ARRAY.getNGroups
     * @see ARRAY.generateCombinations
     * @see ARRAY.matchN
     */
    ARRAY.getGroupsSizeN = function(array, N) {

        var copy = array.slice(0);
        var len = copy.length;
        var originalLen = copy.length;
        var result = [];

        // Init values for the loop algorithm.
        var i, idx;
        var group = [], count = 0;
        for (i=0; i < originalLen; i++) {

            // Get a random idx between 0 and array length.
            idx = Math.floor(Math.random()*len);

            // Prepare the array container for the elements of a new group.
            if (count >= N) {
                result.push(group);
                count = 0;
                group = [];
            }

            // Insert element in the group.
            group.push(copy[idx]);

            // Update.
            copy.splice(idx,1);
            len = copy.length;
            count++;
        }

        // Add any remaining element.
        if (group.length > 0) {
            result.push(group);
        }

        return result;
    };

    /**
     * ## ARRAY._latinSquare
     *
     * Generate a random Latin Square of size S
     *
     * If N is defined, it returns "Latin Rectangle" (SxN)
     *
     * A parameter controls for self-match, i.e. whether the symbol "i"
     * is found or not in in column "i".
     *
     * @api private
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S
     * @param {boolean} Optional. If TRUE self-match is allowed. Defaults TRUE
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY._latinSquare = function(S, N, self) {
        self = ('undefined' === typeof self) ? true : self;
        // Infinite loop.
        if (S === N && !self) return false;
        var seq = [];
        var latin = [];
        for (var i=0; i< S; i++) {
            seq[i] = i;
        }

        var idx = null;

        var start = 0;
        var limit = S;
        var extracted = [];
        if (!self) {
            limit = S-1;
        }

        for (i=0; i < N; i++) {
            do {
                idx = JSUS.randomInt(start,limit);
            }
            while (JSUS.inArray(idx, extracted));
            extracted.push(idx);

            if (idx == 1) {
                latin[i] = seq.slice(idx);
                latin[i].push(0);
            }
            else {
                latin[i] = seq.slice(idx).concat(seq.slice(0,(idx)));
            }

        }

        return latin;
    };

    /**
     * ## ARRAY.latinSquare
     *
     * Generate a random Latin Square of size S
     *
     * If N is defined, it returns "Latin Rectangle" (SxN)
     *
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY.latinSquare = function(S, N) {
        if (!N) N = S;
        if (!S || S < 0 || (N < 0)) return false;
        if (N > S) N = S;

        return ARRAY._latinSquare(S, N, true);
    };

    /**
     * ## ARRAY.latinSquareNoSelf
     *
     * Generate a random Latin Square of size Sx(S-1), where
     * in each column "i", the symbol "i" is not found
     *
     * If N < S, it returns a "Latin Rectangle" (SxN)
     *
     * @param {number} S The number of rows
     * @param {number} Optional. N The number of columns. Defaults N = S-1
     *
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY.latinSquareNoSelf = function(S, N) {
        if (!N) N = S-1;
        if (!S || S < 0 || (N < 0)) return false;
        if (N > S) N = S-1;

        return ARRAY._latinSquare(S, N, false);
    };

    /**
     * ## ARRAY.generateCombinations
     *
     * Generates all distinct combinations of exactly r elements each
     *
     * @param {array} array The array from which the combinations are extracted
     * @param {number} r The number of elements in each combination
     *
     * @return {array} The total sets of combinations
     *
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.matchN
     *
     * Kudos: http://rosettacode.org/wiki/Combinations#JavaScript
     */
    ARRAY.generateCombinations = function combinations(arr, k) {
        var i, subI, ret, sub, next;
        ret = [];
        for (i = 0; i < arr.length; i++) {
            if (k === 1) {
                ret.push( [ arr[i] ] );
            }
            else {
                sub = combinations(arr.slice(i+1, arr.length), k-1);
                for (subI = 0; subI < sub.length; subI++ ){
                    next = sub[subI];
                    next.unshift(arr[i]);
                    ret.push( next );
                }
            }
        }
        return ret;
    };

    /**
     * ## ARRAY.matchN
     *
     * Match each element of the array with N random others
     *
     * If strict is equal to true, elements cannot be matched multiple times.
     *
     * *Important*: this method has a bug / feature. If the strict parameter
     * is set, the last elements could remain without match, because all the
     * other have been already used. Another recombination would be able
     * to match all the elements instead.
     *
     * @param {array} array The array in which operate the matching
     * @param {number} N The number of matches per element
     * @param {boolean} strict Optional. If TRUE, matched elements cannot be
     *   repeated. Defaults, FALSE
     *
     * @return {array} The results of the matching
     *
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.generateCombinations
     */
    ARRAY.matchN = function(array, N, strict) {
        var result, i, copy, group, len, found;
        if (!array) return;
        if (!N) return array;

        result = [];
        len = array.length;
        found = [];
        for (i = 0 ; i < len ; i++) {
            // Recreate the array.
            copy = array.slice(0);
            copy.splice(i,1);
            if (strict) {
                copy = ARRAY.arrayDiff(copy,found);
            }
            group = ARRAY.getNRandom(copy,N);
            // Add to the set of used elements.
            found = found.concat(group);
            // Re-add the current element.
            group.splice(0,0,array[i]);
            result.push(group);

            // Update.
            group = [];
        }
        return result;
    };

    /**
     * ## ARRAY.rep
     *
     * Appends an array to itself a number of times and return a new array
     *
     * The original array is not modified.
     *
     * @param {array} array the array to repeat
     * @param {number} times The number of times the array must be appended
     *   to itself
     *
     * @return {array} A copy of the original array appended to itself
     */
    ARRAY.rep = function(array, times) {
        var i, result;
        if (!array) return;
        if (!times) return array.slice(0);
        if (times < 1) {
            JSUS.log('times must be greater or equal 1', 'ERR');
            return;
        }

        i = 1;
        result = array.slice(0);
        for (; i < times; i++) {
            result = result.concat(array);
        }
        return result;
    };

    /**
     * ## ARRAY.stretch
     *
     * Repeats each element of the array N times
     *
     * N can be specified as an integer or as an array. In the former case all
     * the elements are repeat the same number of times. In the latter, each
     * element can be repeated a custom number of times. If the length of the
     * `times` array differs from that of the array to stretch a recycle rule
     * is applied.
     *
     * The original array is not modified.
     *
     * E.g.:
     *
     * ```js
     *  var foo = [1,2,3];
     *
     *  ARRAY.stretch(foo, 2); // [1, 1, 2, 2, 3, 3]
     *
     *  ARRAY.stretch(foo, [1,2,3]); // [1, 2, 2, 3, 3, 3];
     *
     *  ARRAY.stretch(foo, [2,1]); // [1, 1, 2, 3, 3];
     * ```
     *
     * @param {array} array the array to strech
     * @param {number|array} times The number of times each element
     *   must be repeated
     * @return {array} A stretched copy of the original array
     */
    ARRAY.stretch = function(array, times) {
        var result, i, repeat, j;
        if (!array) return;
        if (!times) return array.slice(0);
        if ('number' === typeof times) {
            if (times < 1) {
                JSUS.log('times must be greater or equal 1', 'ERR');
                return;
            }
            times = ARRAY.rep([times], array.length);
        }

        result = [];
        for (i = 0; i < array.length; i++) {
            repeat = times[(i % times.length)];
            for (j = 0; j < repeat ; j++) {
                result.push(array[i]);
            }
        }
        return result;
    };


    /**
     * ## ARRAY.arrayIntersect
     *
     * Computes the intersection between two arrays
     *
     * Arrays can contain both primitive types and objects.
     *
     * @param {array} a1 The first array
     * @param {array} a2 The second array
     * @return {array} All the values of the first array that are found
     *   also in the second one
     */
    ARRAY.arrayIntersect = function(a1, a2) {
        return a1.filter( function(i) {
            return JSUS.inArray(i, a2);
        });
    };

    /**
     * ## ARRAY.arrayDiff
     *
     * Performs a diff between two arrays
     *
     * Arrays can contain both primitive types and objects.
     *
     * @param {array} a1 The first array
     * @param {array} a2 The second array
     * @return {array} All the values of the first array that are not
     *   found in the second one
     */
    ARRAY.arrayDiff = function(a1, a2) {
        return a1.filter( function(i) {
            return !(JSUS.inArray(i, a2));
        });
    };

    /**
     * ## ARRAY.shuffle
     *
     * Shuffles the elements of the array using the Fischer algorithm
     *
     * The original array is not modified, and a copy is returned.
     *
     * @param {array} shuffle The array to shuffle
     *
     * @return {array} copy The shuffled array
     *
     * @see http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     */
    ARRAY.shuffle = function(array) {
        var copy, len, j, tmp, i;
        if (!array) return;
        copy = Array.prototype.slice.call(array);
        len = array.length-1; // ! -1
        for (i = len; i > 0; i--) {
            j = Math.floor(Math.random()*(i+1));
            tmp = copy[j];
            copy[j] = copy[i];
            copy[i] = tmp;
        }
        return copy;
    };

    /**
     * ## ARRAY.getNRandom
     *
     * Select N random elements from the array and returns them
     *
     * @param {array} array The array from which extracts random elements
     * @paran {number} N The number of random elements to extract
     *
     * @return {array} An new array with N elements randomly chosen
     */
    ARRAY.getNRandom = function(array, N) {
        return ARRAY.shuffle(array).slice(0,N);
    };

    /**
     * ## ARRAY.distinct
     *
     * Removes all duplicates entries from an array and returns a copy of it
     *
     * Does not modify original array.
     *
     * Comparison is done with `JSUS.equals`.
     *
     * @param {array} array The array from which eliminates duplicates
     *
     * @return {array} A copy of the array without duplicates
     *
     * @see JSUS.equals
     */
    ARRAY.distinct = function(array) {
        var out = [];
        if (!array) return out;

        ARRAY.each(array, function(e) {
            if (!ARRAY.inArray(e, out)) {
                out.push(e);
            }
        });
        return out;
    };

    /**
     * ## ARRAY.transpose
     *
     * Transposes a given 2D array.
     *
     * The original array is not modified, and a new copy is
     * returned.
     *
     * @param {array} array The array to transpose
     *
     * @return {array} The Transposed Array
     */
    ARRAY.transpose = function(array) {
        if (!array) return;

        // Calculate width and height
        var w, h, i, j, t = [];
        w = array.length || 0;
        h = (ARRAY.isArray(array[0])) ? array[0].length : 0;
        if (w === 0 || h === 0) return t;

        for ( i = 0; i < h; i++) {
            t[i] = [];
            for ( j = 0; j < w; j++) {
                t[i][j] = array[j][i];
            }
        }
        return t;
    };

    JSUS.extend(ARRAY);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # COMPATIBILITY
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Tests browsers ECMAScript 5 compatibility
 *
 * For more information see http://kangax.github.com/es5-compat-table/
 */
(function(JSUS) {
    "use strict";

    function COMPATIBILITY() {}

    /**
     * ## COMPATIBILITY.compatibility
     *
     * Returns a report of the ECS5 features available
     *
     * Useful when an application routinely performs an operation
     * depending on a potentially unsupported ECS5 feature.
     *
     * Transforms multiple try-catch statements in a if-else
     *
     * @return {object} support The compatibility object
     */
    COMPATIBILITY.compatibility = function() {

        var support = {};

        try {
            Object.defineProperty({}, "a", {enumerable: false, value: 1});
            support.defineProperty = true;
        }
        catch(e) {
            support.defineProperty = false;
        }

        try {
            eval('({ get x(){ return 1 } }).x === 1');
            support.setter = true;
        }
        catch(err) {
            support.setter = false;
        }

        try {
            var value;
            eval('({ set x(v){ value = v; } }).x = 1');
            support.getter = true;
        }
        catch(err) {
            support.getter = false;
        }

        return support;
    };


    JSUS.extend(COMPATIBILITY);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # DOM
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Helper library to perform generic operation with DOM elements.
 */
(function(JSUS) {

    "use strict";

    var onFocusChange, changeTitle;

    function DOM() {}

    // ## GET/ADD

    /**
     * ### DOM.get
     *
     * Creates a generic HTML element with specified attributes
     *
     * @param {string} elem The name of the tag
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element. If
     *   the request element is an 'iframe', the `name` attribute is set
     *   equal to the `id` attribute.
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.add
     * @see DOM.addAttributes
     */
    DOM.get = function(name, attributes) {
        var el;
        el = document.createElement(name);
        if ('string' === typeof attributes) el.id = attributes;
        else if (attributes) this.addAttributes(el, attributes);
        // For firefox, name of iframe must be set as well.
        if (name === 'iframe' && el.id && !el.name) el.name = el.id;
        return el;
    };

    /**
     * ### DOM.add|append
     *
     * Creates and append an element with specified attributes to a root
     *
     * @param {string} name The name of the HTML tag
     * @param {HTMLElement} root The root element to which the new element
     *   will be appended
     * @param {object|string} options Optional. Object containing
     *   attributes for the element and rules about how to insert it relative
     *   to root. Available options: insertAfter, insertBefore (default:
     *   child of root). If string, it is the id of the element. Examples:
     *
     * ```javascript
     * // Appends a new new to the body.
     * var div = DOM.add('div', document.body);
     * // Appends a new new to the body with id 'myid'.
     * var div1 = DOM.add('div', document.body, 'myid');
     * // Appends a new new to the body with id 'myid2' and class name 'c'.
     * var div2 = DOM.add('div', document.body, { id: 'myid2', className: 'c'});
     * // Appends a new div after div1 with id 'myid'.
     * var div3 = DOM.add('div', div1, { id: 'myid3', insertAfter: true });
     * // Appends a new div before div2 with id 'myid'.
     * var div3 = DOM.add('div', div2, { id: 'myid3', insertBefore: true });
     * ```
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.get
     * @see DOM.addAttributes
     */
    DOM.add = DOM.append = function(name, root, options) {
        var el;
        el = this.get(name, options);
        if (options && options.insertBefore) {
            if (options.insertAfter) {
                throw new Error('DOM.add: options.insertBefore and ' +
                                'options.insertBefore cannot be ' +
                                'both set.');
            }
            if (!root.parentNode) {
                throw new Error('DOM.add: root.parentNode not found. ' +
                                'Cannot insert before.');
            }
            root.parentNode.insertBefore(el, root);
        }
        else if (options && options.insertAfter) {
            if (!root.parentNode) {
                throw new Error('DOM.add: root.parentNode not found. ' +
                                'Cannot insert after.');
            }
            DOM.insertAfter(el, root);
        }
        else {
            root.appendChild(el);
        }
        return el;
    };

    /**
     * ### DOM.addAttributes
     *
     * Adds attributes to an HTML element and returns it
     *
     * Attributes are defined as key-values pairs and added
     *
     * Special cases:
     *
     *   - 'className': alias for class
     *   - 'class': add a class to the className property (does not overwrite)
     *   - 'style': adds property to the style property (see DOM.style)
     *   - 'id': the id of the element
     *   - 'innerHTML': the innerHTML property of the element (overwrites)
     *   - 'insertBefore': ignored
     *   - 'insertAfter': ignored
     *
     * @param {HTMLElement} elem The element to decorate
     * @param {object} attributes Object containing attributes to
     *   add to the element
     *
     * @return {HTMLElement} The element with speficied attributes added
     *
     * @see DOM.addClass
     * @see DOM.style
     */
     DOM.addAttributes = function(elem, attributes) {
        var key;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.addAttributes: elem must be ' +
                                'HTMLElement. Found: ' + elem);
        }
        if ('undefined' === typeof attributes) return elem;
        if ('object' !== typeof attributes) {
            throw new TypeError('DOM.addAttributes: attributes must be ' +
                                'object or undefined. Found: ' + attributes);
        }
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                if (key === 'id' || key === 'innerHTML') {
                    elem[key] = attributes[key];
                }
                else if (key === 'class' || key === 'className') {
                    DOM.addClass(elem, attributes[key]);
                }
                else if (key === 'style') {
                    DOM.style(elem, attributes[key]);
                }
                else if (key !== 'insertBefore' && key !== 'insertAfter') {
                    elem.setAttribute(key, attributes[key]);
                }
            }
        }
        return elem;
    };

    // ## WRITE

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into a root element
     *
     * @param {HTMLElement} root The HTML element where to write into
     * @param {string|HTMLElement} text The text to write or an element
     *    to append. Default: an ampty string
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.writeln
     */
    DOM.write = function(root, text) {
        var content;
        if ('undefined' === typeof text || text === null) text = "";
        if (JSUS.isNode(text) || JSUS.isElement(text)) content = text;
        else content = document.createTextNode(text);
        root.appendChild(content);
        return content;
    };

    /**
     * ### DOM.writeln
     *
     * Write a text and a break into a root element
     *
     * Default break element is <br> tag
     *
     * @param {HTMLElement} root The HTML element where to write into
     * @param {string|HTMLElement} text The text to write or an element
     *    to append. Default: an ampty string
     * @param {string} rc the name of the tag to use as a break element
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.write
     */
    DOM.writeln = function(root, text, rc) {
        var content;
        content = DOM.write(root, text);
        this.add(rc || 'br', root);
        return content;
    };

    /**
     * ### DOM.sprintf
     *
     * Builds up a decorated HTML text element
     *
     * Performs string substitution from an args object where the first
     * character of the key bears the following semantic:
     *
     * - '@': variable substitution with escaping
     * - '!': variable substitution without variable escaping
     * - '%': wraps a portion of string into a _span_ element to which is
     *        possible to associate a css class or id. Alternatively,
     *        it also possible to add in-line style. E.g.:
     *
     * ```javascript
     *      sprintf('%sImportant!%s An error has occurred: %pre@err%pre', {
     *              '%pre': {
     *                      style: 'font-size: 12px; font-family: courier;'
     *              },
     *              '%s': {
     *                      id: 'myId',
     *                      'class': 'myClass',
     *              },
     *              '@err': 'file not found',
     *      }, document.body);
     * ```
     *
     * Special span elements are %strong and %em, which add
     * respectively a _strong_ and _em_ tag instead of the default
     * _span_ tag. They cannot be styled.
     *
     * @param {string} string A text to transform
     * @param {object} args Optional. An object containing string
     *   transformations
     * @param {Element} root Optional. An HTML element to which append the
     *    string. Defaults, a new _span_ element
     *
     * @return {Element} The root element.
     */
    DOM.sprintf = function(string, args, root) {

        var text, span, idx_start, idx_finish, idx_replace, idxs;
        var spans, key, i;

        root = root || document.createElement('span');
        spans = {};

        // Create an args object, if none is provided.
        // Defaults %em and %strong are added.
        args = args || {};
        args['%strong'] = '';
        args['%em'] = '';

        // Transform arguments before inserting them.
        for (key in args) {
            if (args.hasOwnProperty(key)) {

                switch(key.charAt(0)) {

                case '%': // Span/Strong/Emph .

                    idx_start = string.indexOf(key);

                    // Pattern not found. No error.
                    if (idx_start === -1) continue;

                    idx_replace = idx_start + key.length;
                    idx_finish = string.indexOf(key, idx_replace);

                    if (idx_finish === -1) {
                        JSUS.log('Error. Could not find closing key: ' + key);
                        continue;
                    }

                    // Can be strong, emph or a generic span.
                    spans[idx_start] = key;

                    break;

                case '@': // Replace and sanitize.
                    string = string.replace(key, escape(args[key]));
                    break;

                case '!': // Replace and not sanitize.
                    string = string.replace(key, args[key]);
                    break;

                default:
                    JSUS.log('Identifier not in [!,@,%]: ' + key[0]);

                }
            }
        }

        // No span to create, return what we have.
        if (!JSUS.size(spans)) {
            return root.appendChild(document.createTextNode(string));
        }

        // Re-assamble the string.

        idxs = JSUS.keys(spans).sort(function(a, b){ return a - b; });
        idx_finish = 0;
        for (i = 0; i < idxs.length; i++) {

            // Add span.
            key = spans[idxs[i]];
            idx_start = string.indexOf(key);

            // Add fragments of string.
            if (idx_finish !== idx_start-1) {
                root.appendChild(document.createTextNode(
                    string.substring(idx_finish, idx_start)));
            }

            idx_replace = idx_start + key.length;
            idx_finish = string.indexOf(key, idx_replace);

            if (key === '%strong') {
                span = document.createElement('strong');
            }
            else if (key === '%em') {
                span = document.createElement('em');
            }
            else {
                span = DOM.get('span', args[key]);
            }

            text = string.substring(idx_replace, idx_finish);

            span.appendChild(document.createTextNode(text));

            root.appendChild(span);
            idx_finish = idx_finish + key.length;
        }

        // Add the final part of the string.
        if (idx_finish !== string.length) {
            root.appendChild(document.createTextNode(
                string.substring(idx_finish)));
        }

        return root;
    };

    // ## ELEMENTS

    /**
     * ### DOM.isNode
     *
     * Returns TRUE if the object is a DOM node
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM node
     */
    DOM.isNode = function(o) {
        if (!o || 'object' !== typeof o) return false;
        return 'object' === typeof Node ? o instanceof Node :
            'number' === typeof o.nodeType &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.isElement
     *
     * Returns TRUE if the object is a DOM element
     *
     * Notice: instanceof HTMLElement is not reliable in Safari, even if
     * the method is defined.
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM element
     */
    DOM.isElement = function(o) {
        return o && 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.shuffleElements
     *
     * Shuffles the order of children of a parent Element
     *
     * All children *must* have the id attribute (live list elements cannot
     * be identified by position).
     *
     * Notice the difference between Elements and Nodes:
     *
     * http://stackoverflow.com/questions/7935689/
     * what-is-the-difference-between-children-and-childnodes-in-javascript
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     * @param {function} cb Optional. A callback to execute one each shuffled
     *   element (after re-positioning). This is always the last parameter, 
     *   so if order is omitted, it goes second. The callback takes as input:
     *     - the element
     *     - the new order
     *     - the old order
     *
     *
     * @return {array} The order used to shuffle the nodes
     */
    DOM.shuffleElements = function(parent, order, cb) {
        var i, len, numOrder, idOrder, children, child;
        var id;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleElements: parent must be a node. ' +
                               'Found: ' + parent);
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleElements: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if ('undefined' === typeof cb && 'function' === typeof order) {
                cb = order;
            }
            else {
                if (!JSUS.isArray(order)) {
                    throw new TypeError('DOM.shuffleElements: order must be ' +
                                        'array. Found: ' + order);
                }
                if (order.length !== parent.children.length) {
                    throw new Error('DOM.shuffleElements: order length must ' +
                                    'match the number of children nodes.');
                }
            }
        }
        if (cb && 'function' !== typeof cb) {
            throw new TypeError('DOM.shuffleElements: order must be ' +
                                'array. Found: ' + order);
        }
        
        // DOM4 compliant browsers.
        children = parent.children;

        //https://developer.mozilla.org/en/DOM/Element.children
        //[IE lt 9] IE < 9
        if ('undefined' === typeof children) {
            child = this.firstChild;
            while (child) {
                if (child.nodeType == 1) children.push(child);
                child = child.nextSibling;
            }
        }

        // Get all ids.
        len = children.length;
        idOrder = new Array(len);
        if (cb) numOrder = new Array(len);
        if (!order) order = JSUS.sample(0, (len-1));
        for (i = 0 ; i < len; i++) {
            id = children[order[i]].id;
            if ('string' !== typeof id || id === "") {
                throw new Error('DOM.shuffleElements: no id found on ' +
                                'child n. ' + order[i]);
            }
            idOrder[i] = id;
            if (cb) numOrder[i] = order[i];
        }

        // Two fors are necessary to follow the real sequence (Live List).
        // However, parent.children is a special object, so the sequence
        // could be unreliable.
        for (i = 0 ; i < len; i++) {
            parent.appendChild(children[idOrder[i]]);
            if (cb) cb(children[idOrder[i]], i, numOrder[i]);
        }
        return idOrder;
    };

    /**
     * ### DOM.populateSelect
     *
     * Appends a list of options into a HTML select element
     *
     * @param {HTMLElement} select HTML select element
     * @param {object} options Optional. List of options to add to
     *   the select element. List is in the format of key-values pairs
     *   as innerHTML and value attributes of the option.
     *
     * @return {HTMLElement} select The updated select element
     */
    DOM.populateSelect = function(select, options) {
        var key, opt;
        if (!DOM.isElement(select)) {
            throw new TypeError('DOM.populateSelect: select must be ' +
                                'HTMLElement. Found: ' + select);
        }
        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('DOM.populateSelect: options must be ' +
                                    'object or undefined. Found: ' + options);
            }
            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    opt = document.createElement('option');
                    opt.value = key;
                    opt.innerHTML = options[key];
                    select.appendChild(opt);
                }
            }
        }
        return select;
    };

    /**
     * ### DOM.removeChildrenFromNode
     *
     * Removes all children from a node
     *
     * @param {HTMLNode} node HTML node.
     */
    DOM.removeChildrenFromNode = function(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
    };

    /**
     * ### DOM.insertAfter
     *
     * Inserts a node element after another one
     *
     * @param {Node} node The node element to insert
     * @param {Node} referenceNode The node element after which the
     *   the insertion is performed
     *
     * @return {Node} The inserted node
     */
    DOM.insertAfter = function(node, referenceNode) {
        return referenceNode.insertBefore(node, referenceNode.nextSibling);
    };

    // ## CSS / JS

    /**
     * ### DOM.addCSS
     *
     * Adds a CSS link to the page
     *
     * @param {string} cssPath The path to the css
     * @param {HTMLElement} root Optional. The root element. If no root
     *    element is passed, it tries document.head, document.body, and
     *    document. If it fails, it throws an error.
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element
     *
     * @return {HTMLElement} The link element
     */
    DOM.addCSS = function(cssPath, root, attributes) {
        if ('string' !== typeof cssPath || cssPath.trim() === '') {
            throw new TypeError('DOM.addCSS: cssPath must be a non-empty ' +
                                'string. Found: ' + cssPath);
        }
        root = root || document.head || document.body || document;
        if (!root) {
            throw new Error('DOM.addCSS: root is undefined, and could not ' +
                            'detect a valid root for css: ' + cssPath);
        }
        attributes = JSUS.mixin({
            rel : 'stylesheet',
            type: 'text/css',
            href: cssPath
        }, attributes);
        return this.add('link', root, attributes);
    };

    /**
     * ### DOM.addJS
     *
     * Adds a JavaScript script to the page
     *
     * @param {string} cssPath The path to the css
     * @param {HTMLElement} root Optional. The root element. If no root
     *    element is passed, it tries document.head, document.body, and
     *    document. If it fails, it throws an error.
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element
     *
     * @return {HTMLElement} The link element
     *
     */
    DOM.addJS = function(jsPath, root, attributes) {
        if ('string' !== typeof jsPath || jsPath.trim() === '') {
            throw new TypeError('DOM.addCSS: jsPath must be a non-empty ' +
                                'string. Found: ' + jsPath);
        }
        root = root || document.head || document.body || document;
        if (!root) {
            throw new Error('DOM.addCSS: root is undefined, and could not ' +
                            'detect a valid root for css: ' + jsPath);
        }
        attributes = JSUS.mixin({
            charset : 'utf-8',
            type: 'text/javascript',
            src: jsPath
        }, attributes);
        return this.add('script', root, attributes);
    };

    // ## STYLE

    /**
     * ### DOM.highlight
     *
     * Highlights an element by adding a custom border around it
     *
     * Three pre-defined modes are implemented:
     *
     * - OK: green
     * - WARN: yellow
     * - ERR: red (default)
     *
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     *
     * ```javascript
     * highlight(myDiv, 'WARN');  // yellow border
     * highlight(myDiv);          // red border
     * highlight(myDiv, '#CCC');  // grey border
     * ```
     *
     * @param {HTMLElement} elem The element to highlight
     * @param {string} code The type of highlight
     *
     * @return {HTMLElement} elem The styled element
     *
     * @see DOM.addBorder
     * @see DOM.style
     */
    DOM.highlight = function(elem, code) {
        var color;
        // Default value is ERR.
        switch (code) {
        case 'OK':
            color =  'green';
            break;
        case 'WARN':
            color = 'yellow';
            break;
        case 'ERR':
            color = 'red';
            break;
        default:
            if (code.charAt(0) === '#') color = code;
            else color = 'red';
        }
        return this.addBorder(elem, color);
    };

    /**
     * ### DOM.addBorder
     *
     * Adds a border around the specified element
     *
     * @param {HTMLElement} elem The element to which adding the borders
     * @param {string} color Optional. The color of border. Default: 'red'.
     * @param {string} width Optional. The width of border. Default: '5px'.
     * @param {string} type Optional. The type of border. Default: 'solid'.
     *
     * @return {HTMLElement} The element to which a border has been added
     */
    DOM.addBorder = function(elem, color, width, type) {
        var properties;
        color = color || 'red';
        width = width || '5px';
        type = type || 'solid';
        properties = { border: width + ' ' + type + ' ' + color };
        return DOM.style(elem, properties);
    };

    /**
     * ### DOM.style
     *
     * Styles an element as an in-line css.
     *
     * Existing style properties are maintained, and new ones added.
     *
     * @param {HTMLElement} elem The element to style
     * @param {object} Objects containing the properties to add.
     *
     * @return {HTMLElement} The styled element
     */
    DOM.style = function(elem, properties) {
        var i;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.style: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (properties) {
            if ('object' !== typeof properties) {
                throw new TypeError('DOM.style: properties must be object or ' +
                                    'undefined. Found: ' + properties);
            }
            for (i in properties) {
                if (properties.hasOwnProperty(i)) {
                    elem.style[i] = properties[i];
                }
            }
        }
        return elem;
    };

    // ## ID

    /**
     * ### DOM.generateUniqueId
     *
     * Generates a unique id for the whole page, frames included
     *
     * The resulting id is of the type: prefix_randomdigits.
     *
     * @param {string} prefix Optional. A given prefix. Default: a random
     *   string of 8 characters.
     * @param {boolean} checkFrames Optional. If TRUE, the id will be unique
     *   all frames as well. Default: TRUE
     *
     * @return {string} id The unique id
     */
    DOM.generateUniqueId = (function() {
        var limit;
        limit = 100;

        // Returns TRUE if id is NOT found in all docs (optimized).
        function scanDocuments(docs, id) {
            var i, len;
            len = docs.length;
            if (len === 1) {
                return !docs[0].document.getElementById(id);
            }
            if (len === 2) {
                return !!(docs[0].document.getElementById(id) &&
                          docs[1].document.getElementById(id));
            }
            i = -1;
            for ( ; ++i < len ; ) {
                if (docs[i].document.getElementById(id)) return false;
            }
            return true;
        }

        return function(prefix, checkFrames) {
            var id, windows;
            var found, counter;

            if (prefix) {
                if ('string' !== typeof prefix && 'number' !== typeof prefix) {
                    throw new TypeError('DOM.generateUniqueId: prefix must ' +
                                        'be string or number. Found: ' +
                                        prefix);
                }
            }
            else {
                prefix = JSUS.randomString(8, 'a');
            }
            id = prefix + '_';

            windows = [ window ];
            if ((checkFrames || 'undefined' === typeof checkFrames) &&
                window.frames) {

                windows = windows.concat(window.frames);
            }

            found = true;
            counter = -1;
            while (found) {
                id = prefix + '_' + JSUS.randomInt(1000);
                found = scanDocuments(windows, id);
                if (++counter > limit) {
                    throw new Error('DOM.generateUniqueId: could not ' +
                                    'find unique id within ' + limit +
                                    ' trials.');
                }
            }
            return id;
        };
    })();

    // ## CLASSES

    /**
     * ### DOM.removeClass
     *
     * Removes a specific class from the classNamex attribute of a given element
     *
     * @param {HTMLElement} el An HTML element
     * @param {string} className The name of a CSS class already in the element
     *
     * @return {HTMLElement|undefined} The HTML element with the removed
     *   class, or undefined if the inputs are misspecified
     */
    DOM.removeClass = function(elem, className) {
        var regexpr, o;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.removeClass: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (className) {
            if ('string' !== typeof className || className.trim() === '') {
                throw new TypeError('DOM.removeClass: className must be ' +
                                    'HTMLElement. Found: ' + className);
            }
            regexpr = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
            o = elem.className = elem.className.replace(regexpr, '' );
        }
        return elem;
    };

    /**
     * ### DOM.addClass
     *
     * Adds one or more classes to the className attribute of the given element
     *
     * Takes care not to overwrite already existing classes.
     *
     * @param {HTMLElement} elem An HTML element
     * @param {string|array} className The name/s of CSS class/es
     *
     * @return {HTMLElement} The HTML element with the additional
     *   class, or undefined if the inputs are misspecified
     */
    DOM.addClass = function(elem, className) {
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.addClass: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (className) {
            if (className instanceof Array) className = className.join(' ');
            if ('string' !== typeof className || className.trim() === '') {
                throw new TypeError('DOM.addClass: className must be ' +
                                    'HTMLElement. Found: ' + className);
            }
            if (!elem.className) elem.className = className;
            else elem.className += (' ' + className);
        }
        return elem;
    };

    /**
     * ### DOM.getElementsByClassName
     *
     * Returns an array of elements with requested class name
     *
     * @param {object} document The document object of a window or iframe
     * @param {string} className The requested className
     * @param {string}  nodeName Optional. If set only elements with
     *   the specified tag name will be searched
     *
     * @return {array} Array of elements with the requested class name
     *
     * @see https://gist.github.com/E01T/6088383
     * @see http://stackoverflow.com/
     *      questions/8808921/selecting-a-css-class-with-xpath
     */
    DOM.getElementsByClassName = function(document, className, nodeName) {
        var result, node, tag, seek, i, rightClass;
        result = [];
        tag = nodeName || '*';
        if (document.evaluate) {
            seek = '//' + tag +
                '[contains(concat(" ", normalize-space(@class), " "), "' +
                className + ' ")]';
            seek = document.evaluate(seek, document, null, 0, null );
            while ((node = seek.iterateNext())) {
                result.push(node);
            }
        }
        else {
            rightClass = new RegExp( '(^| )'+ className +'( |$)' );
            seek = document.getElementsByTagName(tag);
            for (i = 0; i < seek.length; i++)
                if (rightClass.test((node = seek[i]).className )) {
                    result.push(seek[i]);
                }
        }
        return result;
    };

    // ## IFRAME

    /**
     * ### DOM.getIFrameDocument
     *
     * Returns a reference to the document of an iframe object
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLDocument|null} The document of the iframe, or
     *   null if not found.
     */
    DOM.getIFrameDocument = function(iframe) {
        if (!iframe) return null;
        return iframe.contentDocument ||
            iframe.contentWindow ? iframe.contentWindow.document : null;
    };

    /**
     * ### DOM.getIFrameAnyChild
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLElement|undefined} The child, or undefined if none is found
     */
    DOM.getIFrameAnyChild = function(iframe) {
        var contentDocument;
        if (!iframe) return;
        contentDocument = DOM.getIFrameDocument(iframe);
        return contentDocument.head || contentDocument.body ||
            contentDocument.lastChild ||
            contentDocument.getElementsByTagName('html')[0];
    };

    // ## EVENTS

    /**
     * ### DOM.addEvent
     *
     * Adds an event listener to an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to handle
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event will initiate a capture.
     *   Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.removeEvent
     *
     * Kudos:
     * http://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
     */
    DOM.addEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.attachEvent) return element.attachEvent('on' + event, func);
        else return element.addEventListener(event, func, capture);
    };

    /**
     * ### DOM.removeEvent
     *
     * Removes an event listener from an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to remove
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event was registered
     *   as a capture. Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.addEvent
     */
    DOM.removeEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.detachEvent) return element.detachEvent('on' + event, func);
        else return element.removeEventListener(event, func, capture);
    };

    /**
     * ### DOM.onFocusIn
     *
     * Registers a callback to be executed when the page acquires focus
     *
     * @param {function|null} cb Callback executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusIn = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusIn: cb must be function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }

        onFocusChange(cb);
    };

    /**
     * ### DOM.onFocusOut
     *
     * Registers a callback to be executed when the page loses focus
     *
     * @param {function} cb Callback executed if page loses focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusOut = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusOut: cb must be ' +
                                'function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }
        onFocusChange(undefined, cb);
    };

    // ## UI

    /**
     * ### DOM.disableRightClick
     *
     * Disables the popup of the context menu by right clicking with the mouse
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.enableRightClick
     */
    DOM.disableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.captureEvents(Event.MOUSEDOWN);
            doc.onmousedown = function clickNS4(e) {
                if (doc.layers || doc.getElementById && !doc.all) {
                    if (e.which == 2 || e.which == 3) {
                        return false;
                    }
                }
            };
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = function clickIE4() {
                if (event.button == 2) {
                    return false;
                }
            };
        }
        doc.oncontextmenu = function() { return false; };
    };

    /**
     * ### DOM.enableRightClick
     *
     * Enables the popup of the context menu by right clicking with the mouse
     *
     * It unregisters the event handlers created by `DOM.disableRightClick`
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.disableRightClick
     */
    DOM.enableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.releaseEvents(Event.MOUSEDOWN);
            doc.onmousedown = null;
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = null;
        }
        doc.oncontextmenu = null;
    };

    /**
     * ### DOM.disableBackButton
     *
     * Disables/re-enables backward navigation in history of browsed pages
     *
     * When disabling, it inserts twice the current url.
     *
     * It will still be possible to manually select the uri in the
     * history pane and nagivate to it.
     *
     * @param {boolean} disable Optional. If TRUE disables back button,
     *   if FALSE, re-enables it. Default: TRUE.
     *
     * @return {boolean} The state of the back button (TRUE = disabled),
     *   or NULL if the method is not supported by browser.
     */
    DOM.disableBackButton = (function(isDisabled) {
        return function(disable) {
            disable = 'undefined' === typeof disable ? true : disable;
            if (disable && !isDisabled) {
                if (!history.pushState || !history.go) {
                    JSUS.log('DOM.disableBackButton: method not ' +
                             'supported by browser.');
                    return null;
                }
                history.pushState(null, null, location.href);
                window.onpopstate = function(event) {
                    history.go(1);
                };
            }
            else if (isDisabled) {
                window.onpopstate = null;
            }
            isDisabled = disable;
            return disable;
        };
    })(false);

    // ## EXTRA

    /**
     * ### DOM.playSound
     *
     * Plays a sound
     *
     * @param {various} sound Audio tag or path to audio file to be played
     */
    DOM.playSound = 'undefined' === typeof Audio ?
        function() {
            console.log('JSUS.playSound: Audio tag not supported in your' +
                    ' browser. Cannot play sound.');
        } :
        function(sound) {
        var audio;
        if ('string' === typeof sound) {
            audio = new Audio(sound);
        }
        else if ('object' === typeof sound &&
            'function' === typeof sound.play) {
            audio = sound;
        }
        else {
            throw new TypeError('JSUS.playSound: sound must be string' +
               ' or audio element.');
        }
        audio.play();
    };

    /**
     * ### DOM.blinkTitle
     *
     * Changes the title of the page in regular intervals
     *
     * Calling the function without any arguments stops the blinking
     * If an array of strings is provided, that array will be cycled through.
     * If a signle string is provided, the title will alternate between '!!!'
     *   and that string.
     *
     * @param {mixed} titles New title to blink
     * @param {object} options Optional. Configuration object.
     *   Accepted values and default in parenthesis:
     *
     *     - stopOnFocus (false): Stop blinking if user switched to tab
     *     - stopOnClick (false): Stop blinking if user clicks on the
     *         specified element
     *     - finalTitle (document.title): Title to set after blinking is done
     *     - repeatFor (undefined): Show each element in titles at most
     *         N times -- might be stopped earlier by other events.
     *     - startOnBlur(false): Start blinking if user switches
     *          away from tab
     *     - period (1000) How much time between two blinking texts in the title
     *
     * @return {function|null} A function to clear the blinking of texts,
     *    or NULL, if the interval was not created yet (e.g. with startOnBlur
     *    option), or just destroyed.
     */
    DOM.blinkTitle = (function(id) {
        var clearBlinkInterval, finalTitle, elem;
        clearBlinkInterval = function(opts) {
            clearInterval(id);
            id = null;
            if (elem) {
                elem.removeEventListener('click', clearBlinkInterval);
                elem = null;
            }
            if (finalTitle) {
                document.title = finalTitle;
                finalTitle = null;
            }
        };
        return function(titles, options) {
            var period, where, rotation;
            var rotationId, nRepeats;

            if (null !== id) clearBlinkInterval();
            if ('undefined' === typeof titles) return null;

            where = 'JSUS.blinkTitle: ';
            options = options || {};

            // Option finalTitle.
            if ('undefined' === typeof options.finalTitle) {
                finalTitle = document.title;
            }
            else if ('string' === typeof options.finalTitle) {
                finalTitle = options.finalTitle;
            }
            else {
                throw new TypeError(where + 'options.finalTitle must be ' +
                                    'string or undefined. Found: ' +
                                    options.finalTitle);
            }

            // Option repeatFor.
            if ('undefined' !== typeof options.repeatFor) {
                nRepeats = JSUS.isInt(options.repeatFor, 0);
                if (false === nRepeats) {
                    throw new TypeError(where + 'options.repeatFor must be ' +
                                        'a positive integer. Found: ' +
                                        options.repeatFor);
                }
            }

            // Option stopOnFocus.
            if (options.stopOnFocus) {
                JSUS.onFocusIn(function() {
                    clearBlinkInterval();
                    onFocusChange(null, null);
                });
            }

            // Option stopOnClick.
            if ('undefined' !== typeof options.stopOnClick) {
                if ('object' !== typeof options.stopOnClick ||
                    !options.stopOnClick.addEventListener) {

                    throw new TypeError(where + 'options.stopOnClick must be ' +
                                        'an HTML element with method ' +
                                        'addEventListener. Found: ' +
                                        options.stopOnClick);
                }
                elem = options.stopOnClick;
                elem.addEventListener('click', clearBlinkInterval);
            }

            // Option startOnBlur.
            if (options.startOnBlur) {
                options.startOnBlur = null;
                JSUS.onFocusOut(function() {
                    JSUS.blinkTitle(titles, options);
                });
                return null;
            }

            // Prepare the rotation.
            if ('string' === typeof titles) {
                titles = [titles, '!!!'];
            }
            else if (!JSUS.isArray(titles)) {
                throw new TypeError(where + 'titles must be string, ' +
                                    'array of strings or undefined.');
            }
            rotationId = 0;
            period = options.period || 1000;
            // Function to be executed every period.
            rotation = function() {
                changeTitle(titles[rotationId]);
                rotationId = (rotationId+1) % titles.length;
                // Control the number of times it should be cycled through.
                if ('number' === typeof nRepeats) {
                    if (rotationId === 0) {
                        nRepeats--;
                        if (nRepeats === 0) clearBlinkInterval();
                    }
                }
            };
            // Perform first rotation right now.
            rotation();
            id = setInterval(rotation, period);

            // Return clear function.
            return clearBlinkInterval;
        };
    })(null);

    /**
     * ### DOM.cookieSupport
     *
     * Tests for cookie support
     *
     * @return {boolean|null} The type of support for cookies. Values:
     *
     *   - null: no cookies
     *   - false: only session cookies
     *   - true: session cookies and persistent cookies (although
     *       the browser might clear them on exit)
     *
     * Kudos: http://stackoverflow.com/questions/2167310/
     *        how-to-show-a-message-only-if-cookies-are-disabled-in-browser
     */
    DOM.cookieSupport = function() {
        var c, persist;
        persist = true;
        do {
            c = 'gCStest=' + Math.floor(Math.random()*100000000);
            document.cookie = persist ? c +
                ';expires=Tue, 01-Jan-2030 00:00:00 GMT' : c;

            if (document.cookie.indexOf(c) !== -1) {
                document.cookie= c + ';expires=Sat, 01-Jan-2000 00:00:00 GMT';
                return persist;
            }
        } while (!(persist = !persist));

        return null;
    };

    /**
     * ### DOM.viewportSize
     *
     * Returns the current size of the viewport in pixels
     *
     * The viewport's size is the actual visible part of the browser's
     * window. This excludes, for example, the area occupied by the
     * JavaScript console.
     *
     * @param {string} dim Optional. Controls the return value ('x', or 'y')
     *
     * @return {object|number} An object containing x and y property, or
     *   number specifying the value for x or y
     *
     * Kudos: http://stackoverflow.com/questions/3437786/
     *        get-the-size-of-the-screen-current-web-page-and-browser-window
     */
    DOM.viewportSize = function(dim) {
        var w, d, e, g, x, y;
        if (dim && dim !== 'x' && dim !== 'y') {
            throw new TypeError('DOM.viewportSize: dim must be "x","y" or ' +
                                'undefined. Found: ' + dim);
        }
        w = window;
        d = document;
        e = d.documentElement;
        g = d.getElementsByTagName('body')[0];
        x = w.innerWidth || e.clientWidth || g.clientWidth;
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        return !dim ? { x: x, y: y } : dim === 'x' ? x : y;
    };

    // ## Helper methods

    /**
     * ### onFocusChange
     *
     * Helper function for DOM.onFocusIn and DOM.onFocusOut (cross-browser)
     *
     * Expects only one callback, either inCb, or outCb.
     *
     * @param {function|null} inCb Optional. Executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {function|null} outCb Optional. Executed if page loses focus,
     *   or NULL, to delete an existing callback.
     *
     * Kudos: http://stackoverflow.com/questions/1060008/
     *   is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
     *
     * @see http://www.w3.org/TR/page-visibility/
     */
    onFocusChange = (function(document) {
        var inFocusCb, outFocusCb, event, hidden, evtMap;

        if (!document) {
            return function() {
                JSUS.log('onFocusChange: no document detected.');
                return;
            };
        }

        if ('hidden' in document) {
            hidden = 'hidden';
            event = 'visibilitychange';
        }
        else if ('mozHidden' in document) {
            hidden = 'mozHidden';
            event = 'mozvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            hidden = 'webkitHidden';
            event = 'webkitvisibilitychange';
        }
        else if ('msHidden' in document) {
            hidden = 'msHidden';
            event = 'msvisibilitychange';
        }

        evtMap = {
            focus: true, focusin: true, pageshow: true,
            blur: false, focusout: false, pagehide: false
        };

        function onchange(evt) {
            var isHidden;
            evt = evt || window.event;
            // If event is defined as one from event Map.
            if (evt.type in evtMap) isHidden = evtMap[evt.type];
            // Or use the hidden property.
            else isHidden = this[hidden] ? true : false;
            // Call the callback, if defined.
            if (!isHidden) { if (inFocusCb) inFocusCb(); }
            else { if (outFocusCb) outFocusCb(); }
        }

        return function(inCb, outCb) {
            var onchangeCb;

            if ('undefined' !== typeof inCb) inFocusCb = inCb;
            else outFocusCb = outCb;

            onchangeCb = !inFocusCb && !outFocusCb ? null : onchange;

            // Visibility standard detected.
            if (event) {
                if (onchangeCb) document.addEventListener(event, onchange);
                else document.removeEventListener(event, onchange);
            }
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchangeCb;
            }
            // All others.
            else {
                window.onpageshow = window.onpagehide =
                    window.onfocus = window.onblur = onchangeCb;
            }
        };
    })('undefined' !== typeof document ? document : null);

    /**
     * ### changeTitle
     *
     * Changes title of page
     *
     * @param {string} title New title of the page
     */
    changeTitle = function(title) {
        if ('string' === typeof title) {
            document.title = title;
        }
        else {
            throw new TypeError('JSUS.changeTitle: title must be string. ' +
                                'Found: ' + title);
        }
    };

    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # DOM
 *
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to DOM manipulation
 *
 * Helper library to perform generic operation with DOM elements.
 *
 * The general syntax is the following: Every HTML element has associated
 * a get* and a add* method, whose syntax is very similar.
 *
 * - The get* method creates the element and returns it.
 * - The add* method creates the element, append it as child to a root element,
 *     and then returns it.
 *
 * The syntax of both method is the same, but the add* method
 * needs the root element as first parameter. E.g.
 *
 * - getButton(id, text, attributes);
 * - addButton(root, id, text, attributes);
 *
 * The last parameter is generally an object containing a list of
 * of key-values pairs as additional attributes to set to the element.
 *
 * Only the methods which do not follow the above-mentioned syntax
 * will receive further explanation.
 */
(function(JSUS) {

    "use strict";

    var onFocusChange, changeTitle;

    function DOM() {}

    // ## GENERAL

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into a root element
     *
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.writeln
     */
    DOM.write = function(root, text) {
        var content;
        if ('undefined' === typeof text || text === null) text = "";
        if (JSUS.isNode(text) || JSUS.isElement(text)) content = text;
        else content = document.createTextNode(text);
        root.appendChild(content);
        return content;
    };

    /**
     * ### DOM.writeln
     *
     * Write a text and a break into a root element
     *
     * Default break element is <br> tag
     *
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
     * @param {string} rc the name of the tag to use as a break element
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.write
     * @see DOM.addBreak
     */
    DOM.writeln = function(root, text, rc) {
        var content;
        content = DOM.write(root, text);
        this.addBreak(root, rc);
        return content;
    };

    /**
     * ### DOM.sprintf
     *
     * Builds up a decorated HTML text element
     *
     * Performs string substitution from an args object where the first
     * character of the key bears the following semantic:
     *
     * - '@': variable substitution with escaping
     * - '!': variable substitution without variable escaping
     * - '%': wraps a portion of string into a _span_ element to which is
     *        possible to associate a css class or id. Alternatively,
     *        it also possible to add in-line style. E.g.:
     *
     * ```javascript
     *      sprintf('%sImportant!%s An error has occurred: %pre@err%pre', {
     *              '%pre': {
     *                      style: 'font-size: 12px; font-family: courier;'
     *              },
     *              '%s': {
     *                      id: 'myId',
     *                      'class': 'myClass',
     *              },
     *              '@err': 'file not found',
     *      }, document.body);
     * ```
     *
     * Special span elements are %strong and %em, which add
     * respectively a _strong_ and _em_ tag instead of the default
     * _span_ tag. They cannot be styled.
     *
     * @param {string} string A text to transform
     * @param {object} args Optional. An object containing string
     *   transformations
     * @param {Element} root Optional. An HTML element to which append the
     *    string. Defaults, a new _span_ element
     *
     * @return {Element} The root element.
     */
    DOM.sprintf = function(string, args, root) {

        var text, span, idx_start, idx_finish, idx_replace, idxs;
        var spans, key, i;

        root = root || document.createElement('span');
        spans = {};

        // Create an args object, if none is provided.
        // Defaults %em and %strong are added.
        args = args || {};
        args['%strong'] = '';
        args['%em'] = '';

        // Transform arguments before inserting them.
        for (key in args) {
            if (args.hasOwnProperty(key)) {

                switch(key.charAt(0)) {

                case '%': // Span/Strong/Emph .

                    idx_start = string.indexOf(key);

                    // Pattern not found. No error.
                    if (idx_start === -1) continue;

                    idx_replace = idx_start + key.length;
                    idx_finish = string.indexOf(key, idx_replace);

                    if (idx_finish === -1) {
                        JSUS.log('Error. Could not find closing key: ' + key);
                        continue;
                    }

                    // Can be strong, emph or a generic span.
                    spans[idx_start] = key;

                    break;

                case '@': // Replace and sanitize.
                    string = string.replace(key, escape(args[key]));
                    break;

                case '!': // Replace and not sanitize.
                    string = string.replace(key, args[key]);
                    break;

                default:
                    JSUS.log('Identifier not in [!,@,%]: ' + key[0]);

                }
            }
        }

        // No span to create, return what we have.
        if (!JSUS.size(spans)) {
            return root.appendChild(document.createTextNode(string));
        }

        // Re-assamble the string.

        idxs = JSUS.keys(spans).sort(function(a, b){ return a - b; });
        idx_finish = 0;
        for (i = 0; i < idxs.length; i++) {

            // Add span.
            key = spans[idxs[i]];
            idx_start = string.indexOf(key);

            // Add fragments of string.
            if (idx_finish !== idx_start-1) {
                root.appendChild(document.createTextNode(
                    string.substring(idx_finish, idx_start)));
            }

            idx_replace = idx_start + key.length;
            idx_finish = string.indexOf(key, idx_replace);

            if (key === '%strong') {
                span = document.createElement('strong');
            }
            else if (key === '%em') {
                span = document.createElement('em');
            }
            else {
                span = JSUS.getElement('span', null, args[key]);
            }

            text = string.substring(idx_replace, idx_finish);

            span.appendChild(document.createTextNode(text));

            root.appendChild(span);
            idx_finish = idx_finish + key.length;
        }

        // Add the final part of the string.
        if (idx_finish !== string.length) {
            root.appendChild(document.createTextNode(
                string.substring(idx_finish)));
        }

        return root;
    };

    /**
     * ### DOM.isNode
     *
     * Returns TRUE if the object is a DOM node
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM node
     */
    DOM.isNode = function(o) {
        if (!o || 'object' !== typeof o) return false;
        return 'object' === typeof Node ? o instanceof Node :
            'number' === typeof o.nodeType &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.isElement
     *
     * Returns TRUE if the object is a DOM element
     *
     * Notice: instanceof HTMLElement is not reliable in Safari, even if
     * the method is defined.
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM element
     */
    DOM.isElement = function(o) {
        return o && 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.shuffleElements
     *
     * Shuffles the order of children of a parent Element
     *
     * All children *must* have the id attribute (live list elements cannot
     * be identified by position).
     *
     * Notice the difference between Elements and Nodes:
     *
     * http://stackoverflow.com/questions/7935689/
     * what-is-the-difference-between-children-and-childnodes-in-javascript
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     *
     * @return {array} The order used to shuffle the nodes
     */
    DOM.shuffleElements = function(parent, order) {
        var i, len, idOrder, children, child;
        var id, forceId, missId;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleElements: parent must be a node. ' +
                               'Found: ' + parent);
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleElements: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if (!JSUS.isArray(order)) {
                throw new TypeError('DOM.shuffleElements: order must array.' +
                                   'Found: ' + order);
            }
            if (order.length !== parent.children.length) {
                throw new Error('DOM.shuffleElements: order length must ' +
                                'match the number of children nodes.');
            }
        }

        // DOM4 compliant browsers.
        children = parent.children;

        //https://developer.mozilla.org/en/DOM/Element.children
        //[IE lt 9] IE < 9
        if ('undefined' === typeof children) {
            child = this.firstChild;
            while (child) {
                if (child.nodeType == 1) children.push(child);
                child = child.nextSibling;
            }
        }

        len = children.length;
        idOrder = new Array(len);
        if (!order) order = JSUS.sample(0, (len-1));
        for (i = 0 ; i < len; i++) {
            id = children[order[i]].id;
            if ('string' !== typeof id || id === "") {
                throw new Error('DOM.shuffleElements: no id found on ' +
                                'child n. ' + order[i] + '.');
            }
            idOrder[i] = id;
        }

        // Two fors are necessary to follow the real sequence (Live List).
        // However, parent.children is a special object, so the sequence
        // could be unreliable.
        for (i = 0 ; i < len; i++) {
            parent.appendChild(children[idOrder[i]]);
        }
        return idOrder;
    };

    /**
     * ### DOM.shuffleNodes
     *
     * It actually shuffles Elements.
     *
     * @deprecated
     */
    DOM.shuffleNodes = function(parent, order) {
        console.log('***DOM.shuffleNodes is deprecated. ' +
                    'Use Dom.shuffleElements instead.***');
        return DOM.shuffleElements(parent, order);
    };

    /**
     * ### DOM.getElement
     *
     * Creates a generic HTML element with id and attributes as specified
     *
     * @param {string} elem The name of the tag
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.addAttributes2Elem
     */
    DOM.getElement = function(elem, id, attributes) {
        var e = document.createElement(elem);
        if ('undefined' !== typeof id) {
            e.id = id;
        }
        return this.addAttributes2Elem(e, attributes);
    };

    /**
     * ### DOM.addElement
     *
     * Creates and appends a generic HTML element with specified attributes
     *
     * @param {string} elem The name of the tag
     * @param {HTMLElement} root The root element to which the new element will
     *   be appended
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.getElement
     * @see DOM.addAttributes2Elem
     */
    DOM.addElement = function(elem, root, id, attributes) {
        var el = this.getElement(elem, id, attributes);
        return root.appendChild(el);
    };

    /**
     * ### DOM.addAttributes2Elem
     *
     * Adds attributes to an HTML element and returns it.
     *
     * Attributes are defined as key-values pairs.
     * Attributes 'label' is ignored, attribute 'className' ('class') and
     * 'style' are special and are delegated to special methods.
     *
     * @param {HTMLElement} e The element to decorate
     * @param {object} a Object containing attributes to add to the element
     *
     * @return {HTMLElement} The decorated element
     *
     * @see DOM.addLabel
     * @see DOM.addClass
     * @see DOM.style
     */
    DOM.addAttributes2Elem = function(e, a) {
        var key;
        if (!e || !a) return e;
        if ('object' != typeof a) return e;
        for (key in a) {
            if (a.hasOwnProperty(key)) {
                if (key === 'id') {
                    e.id = a[key];
                }
                else if (key === 'class' || key === 'className') {
                    DOM.addClass(e, a[key]);
                }
                else if (key === 'style') {
                    DOM.style(e, a[key]);
                }
                else if (key === 'label') {
                    // Handle the case.
                    JSUS.log('DOM.addAttributes2Elem: label attribute is not ' +
                             'supported. Use DOM.addLabel instead.');
                }
                else {
                    e.setAttribute(key, a[key]);
                }


                // TODO: handle special cases
                // <!--
                //else {
                //
                //    // If there is no parent node,
                //    // the legend cannot be created
                //    if (!e.parentNode) {
                //        node.log('Cannot add label: ' +
                //                 'no parent element found', 'ERR');
                //        continue;
                //    }
                //
                //    this.addLabel(e.parentNode, e, a[key]);
                //}
                // -->
            }
        }
        return e;
    };

    /**
     * ### DOM.populateSelect
     *
     * Appends a list of options into a HTML select element.
     * The second parameter list is an object containing
     * a list of key-values pairs as text-value attributes for
     * the option.
     *
     * @param {HTMLElement} select HTML select element
     * @param {object} list Options to add to the select element
     */
    DOM.populateSelect = function(select, list) {
        var key, opt;
        if (!select || !list) return;
        for (key in list) {
            if (list.hasOwnProperty(key)) {
                opt = document.createElement('option');
                opt.value = list[key];
                opt.appendChild(document.createTextNode(key));
                select.appendChild(opt);
            }
        }
    };

    /**
     * ### DOM.removeChildrenFromNode
     *
     * Removes all children from a node.
     *
     * @param {HTMLElement} e HTML element.
     */
    DOM.removeChildrenFromNode = function(e) {
        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
    };

    /**
     * ### DOM.insertAfter
     *
     * Insert a node element after another one.
     *
     * The first parameter is the node to add.
     *
     */
    DOM.insertAfter = function(node, referenceNode) {
        referenceNode.insertBefore(node, referenceNode.nextSibling);
    };

    /**
     * ### DOM.generateUniqueId
     *
     * Generate a unique id for the page (frames included).
     *
     * TODO: now it always create big random strings, it does not actually
     * check if the string exists.
     *
     */
    DOM.generateUniqueId = function(prefix) {
        var search = [window];
        if (window.frames) {
            search = search.concat(window.frames);
        }

        function scanDocuments(id) {
            var found = true;
            while (found) {
                for (var i=0; i < search.length; i++) {
                    found = search[i].document.getElementById(id);
                    if (found) {
                        id = '' + id + '_' + JSUS.randomInt(0, 1000);
                        break;
                    }
                }
            }
            return id;
        }


        return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
        //return scanDocuments(prefix);
    };

    // ## GET/ADD

    /**
     * ### DOM.getButton
     *
     */
    DOM.getButton = function(id, text, attributes) {
        var sb;
        sb = document.createElement('button');
        if ('undefined' !== typeof id) sb.id = id;
        sb.appendChild(document.createTextNode(text || 'Send'));
        return this.addAttributes2Elem(sb, attributes);
    };

    /**
     * ### DOM.addButton
     *
     */
    DOM.addButton = function(root, id, text, attributes) {
        var b = this.getButton(id, text, attributes);
        return root.appendChild(b);
    };

    /**
     * ### DOM.getFieldset
     *
     */
    DOM.getFieldset = function(id, legend, attributes) {
        var f = this.getElement('fieldset', id, attributes);
        var l = document.createElement('Legend');
        l.appendChild(document.createTextNode(legend));
        f.appendChild(l);
        return f;
    };

    /**
     * ### DOM.addFieldset
     *
     */
    DOM.addFieldset = function(root, id, legend, attributes) {
        var f = this.getFieldset(id, legend, attributes);
        return root.appendChild(f);
    };

    /**
     * ### DOM.getTextInput
     *
     */
    DOM.getTextInput = function(id, attributes) {
        var ti =  document.createElement('input');
        if ('undefined' !== typeof id) ti.id = id;
        ti.setAttribute('type', 'text');
        return this.addAttributes2Elem(ti, attributes);
    };

    /**
     * ### DOM.addTextInput
     *
     */
    DOM.addTextInput = function(root, id, attributes) {
        var ti = this.getTextInput(id, attributes);
        return root.appendChild(ti);
    };

    /**
     * ### DOM.getTextArea
     *
     */
    DOM.getTextArea = function(id, attributes) {
        var ta =  document.createElement('textarea');
        if ('undefined' !== typeof id) ta.id = id;
        return this.addAttributes2Elem(ta, attributes);
    };

    /**
     * ### DOM.addTextArea
     *
     */
    DOM.addTextArea = function(root, id, attributes) {
        var ta = this.getTextArea(id, attributes);
        return root.appendChild(ta);
    };

    /**
     * ### DOM.getCanvas
     *
     */
    DOM.getCanvas = function(id, attributes) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        if (!context) {
            alert('Canvas is not supported');
            return false;
        }

        canvas.id = id;
        return this.addAttributes2Elem(canvas, attributes);
    };

    /**
     * ### DOM.addCanvas
     *
     */
    DOM.addCanvas = function(root, id, attributes) {
        var c = this.getCanvas(id, attributes);
        return root.appendChild(c);
    };

    /**
     * ### DOM.getSlider
     *
     */
    DOM.getSlider = function(id, attributes) {
        var slider = document.createElement('input');
        slider.id = id;
        slider.setAttribute('type', 'range');
        return this.addAttributes2Elem(slider, attributes);
    };

    /**
     * ### DOM.addSlider
     *
     */
    DOM.addSlider = function(root, id, attributes) {
        var s = this.getSlider(id, attributes);
        return root.appendChild(s);
    };

    /**
     * ### DOM.getRadioButton
     *
     */
    DOM.getRadioButton = function(id, attributes) {
        var radio = document.createElement('input');
        radio.id = id;
        radio.setAttribute('type', 'radio');
        return this.addAttributes2Elem(radio, attributes);
    };

    /**
     * ### DOM.addRadioButton
     *
     */
    DOM.addRadioButton = function(root, id, attributes) {
        var rb = this.getRadioButton(id, attributes);
        return root.appendChild(rb);
    };

    /**
     * ### DOM.getLabel
     *
     */
    DOM.getLabel = function(forElem, id, labelText, attributes) {
        if (!forElem) return false;
        var label = document.createElement('label');
        label.id = id;
        label.appendChild(document.createTextNode(labelText));

        if ('undefined' === typeof forElem.id) {
            forElem.id = this.generateUniqueId();
        }

        label.setAttribute('for', forElem.id);
        this.addAttributes2Elem(label, attributes);
        return label;
    };

    /**
     * ### DOM.addLabel
     *
     */
    DOM.addLabel = function(root, forElem, id, labelText, attributes) {
        if (!root || !forElem || !labelText) return false;
        var l = this.getLabel(forElem, id, labelText, attributes);
        root.insertBefore(l, forElem);
        return l;
    };

    /**
     * ### DOM.getSelect
     *
     */
    DOM.getSelect = function(id, attributes) {
        return this.getElement('select', id, attributes);
    };

    /**
     * ### DOM.addSelect
     *
     */
    DOM.addSelect = function(root, id, attributes) {
        return this.addElement('select', root, id, attributes);
    };

    /**
     * ### DOM.getIFrame
     *
     */
    DOM.getIFrame = function(id, attributes) {
        attributes = attributes || {};
        if (!attributes.name) {
            attributes.name = id; // For Firefox
        }
        return this.getElement('iframe', id, attributes);
    };

    /**
     * ### DOM.addIFrame
     *
     */
    DOM.addIFrame = function(root, id, attributes) {
        var ifr = this.getIFrame(id, attributes);
        return root.appendChild(ifr);
    };

    /**
     * ### DOM.addBreak
     *
     */
    DOM.addBreak = function(root, rc) {
        var RC = rc || 'br';
        var br = document.createElement(RC);
        return root.appendChild(br);
        //return this.insertAfter(br,root);
    };

    /**
     * ### DOM.getDiv
     *
     */
    DOM.getDiv = function(id, attributes) {
        return this.getElement('div', id, attributes);
    };

    /**
     * ### DOM.addDiv
     *
     */
    DOM.addDiv = function(root, id, attributes) {
        return this.addElement('div', root, id, attributes);
    };

    // ## CSS / JS

    /**
     * ### DOM.addCSS
     *
     * If no root element is passed, it tries to add the CSS
     * link element to document.head, document.body, and
     * finally document. If it fails, returns FALSE.
     *
     */
    DOM.addCSS = function(root, css, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {rel : 'stylesheet',
                                             type: 'text/css',
                                             href: css
                                            });

        return this.addElement('link', root, id, attributes);
    };

    /**
     * ### DOM.addJS
     *
     */
    DOM.addJS = function(root, js, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {charset : 'utf-8',
                                             type: 'text/javascript',
                                             src: js
                                            });

        return this.addElement('script', root, id, attributes);
    };

    /**
     * ### DOM.highlight
     *
     * Provides a simple way to highlight an HTML element
     * by adding a colored border around it.
     *
     * Three pre-defined modes are implemented:
     *
     * - OK: green
     * - WARN: yellow
     * - ERR: red (default)
     *
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     *
     * ```javascript
     * highlight(myDiv, 'WARN'); // yellow border
     * highlight(myDiv);          // red border
     * highlight(myDiv, '#CCC'); // grey border
     * ```
     *
     * @param {HTMLElement} elem The element to highlight
     * @param {string} code The type of highlight
     *
     * @see DOM.addBorder
     * @see DOM.style
     */
    DOM.highlight = function(elem, code) {
        var color;
        if (!elem) return;

        // default value is ERR
        switch (code) {
        case 'OK':
            color =  'green';
            break;
        case 'WARN':
            color = 'yellow';
            break;
        case 'ERR':
            color = 'red';
            break;
        default:
            if (code.charAt(0) === '#') {
                color = code;
            }
            else {
                color = 'red';
            }
        }

        return this.addBorder(elem, color);
    };

    /**
     * ### DOM.addBorder
     *
     * Adds a border around the specified element. Color,
     * width, and type can be specified.
     */
    DOM.addBorder = function(elem, color, width, type) {
        var properties;
        if (!elem) return;

        color = color || 'red';
        width = width || '5px';
        type = type || 'solid';

        properties = { border: width + ' ' + type + ' ' + color };
        return DOM.style(elem, properties);
    };

    /**
     * ### DOM.style
     *
     * Styles an element as an in-line css.
     *
     * Existing style properties are maintained, and new ones added.
     *
     * @param {HTMLElement} elem The element to style
     * @param {object} Objects containing the properties to add.
     *
     * @return {HTMLElement} The styled element
     */
    DOM.style = function(elem, properties) {
        var i;
        if (!elem || !properties) return;
        if (!DOM.isElement(elem)) return;

        for (i in properties) {
            if (properties.hasOwnProperty(i)) {
                elem.style[i] = properties[i];
            }
        }
        return elem;
    };

    /**
     * ### DOM.removeClass
     *
     * Removes a specific class from the classNamex attribute of a given element
     *
     * @param {HTMLElement} el An HTML element
     * @param {string} c The name of a CSS class already in the element
     *
     * @return {HTMLElement|undefined} The HTML element with the removed
     *   class, or undefined if the inputs are misspecified
     */
    DOM.removeClass = function(el, c) {
        var regexpr, o;
        if (!el || !c) return;
        regexpr = new RegExp('(?:^|\\s)' + c + '(?!\\S)');
        o = el.className = el.className.replace( regexpr, '' );
        return el;
    };

    /**
     * ### DOM.addClass
     *
     * Adds one or more classes to the className attribute of the given element
     *
     * Takes care not to overwrite already existing classes.
     *
     * @param {HTMLElement} el An HTML element
     * @param {string|array} c The name/s of CSS class/es
     *
     * @return {HTMLElement|undefined} The HTML element with the additional
     *   class, or undefined if the inputs are misspecified
     */
    DOM.addClass = function(el, c) {
        if (!el) return;
        if (c instanceof Array) c = c.join(' ');
        else if ('string' !== typeof c) return;
        if (!el.className || el.className === '') el.className = c;
        else el.className += (' ' + c);
        return el;
    };

    /**
     * ### DOM.getElementsByClassName
     *
     * Returns an array of elements with requested class name
     *
     * @param {object} document The document object of a window or iframe
     * @param {string} className The requested className
     * @param {string}  nodeName Optional. If set only elements with
     *   the specified tag name will be searched
     *
     * @return {array} Array of elements with the requested class name
     *
     * @see https://gist.github.com/E01T/6088383
     * @see http://stackoverflow.com/
     *      questions/8808921/selecting-a-css-class-with-xpath
     */
    DOM.getElementsByClassName = function(document, className, nodeName) {
        var result, node, tag, seek, i, rightClass;
        result = [];
        tag = nodeName || '*';
        if (document.evaluate) {
            seek = '//' + tag +
                '[contains(concat(" ", normalize-space(@class), " "), "' +
                className + ' ")]';
            seek = document.evaluate(seek, document, null, 0, null );
            while ((node = seek.iterateNext())) {
                result.push(node);
            }
        }
        else {
            rightClass = new RegExp( '(^| )'+ className +'( |$)' );
            seek = document.getElementsByTagName(tag);
            for (i = 0; i < seek.length; i++)
                if (rightClass.test((node = seek[i]).className )) {
                    result.push(seek[i]);
                }
        }
        return result;
    };

    // ## IFRAME

    /**
     * ### DOM.getIFrameDocument
     *
     * Returns a reference to the document of an iframe object
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLDocument|null} The document of the iframe, or
     *   null if not found.
     */
    DOM.getIFrameDocument = function(iframe) {
        if (!iframe) return null;
        return iframe.contentDocument ||
            iframe.contentWindow ? iframe.contentWindow.document : null;
    };

    /**
     * ### DOM.getIFrameAnyChild
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLElement|undefined} The child, or undefined if none is found
     */
    DOM.getIFrameAnyChild = function(iframe) {
        var contentDocument;
        if (!iframe) return;
        contentDocument = W.getIFrameDocument(iframe);
        return contentDocument.head || contentDocument.body ||
            contentDocument.lastChild ||
            contentDocument.getElementsByTagName('html')[0];
    };

    // ## RIGHT-CLICK

    /**
     * ### DOM.disableRightClick
     *
     * Disables the popup of the context menu by right clicking with the mouse
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.enableRightClick
     */
    DOM.disableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.captureEvents(Event.MOUSEDOWN);
            doc.onmousedown = function clickNS4(e) {
                if (doc.layers || doc.getElementById && !doc.all) {
                    if (e.which == 2 || e.which == 3) {
                        return false;
                    }
                }
            };
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = function clickIE4() {
                if (event.button == 2) {
                    return false;
                }
            };
        }
        doc.oncontextmenu = new Function("return false");
    };

    /**
     * ### DOM.enableRightClick
     *
     * Enables the popup of the context menu by right clicking with the mouse
     *
     * It unregisters the event handlers created by `DOM.disableRightClick`
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.disableRightClick
     */
    DOM.enableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.releaseEvents(Event.MOUSEDOWN);
            doc.onmousedown = null;
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = null;
        }
        doc.oncontextmenu = null;
    };

    /**
     * ### DOM.addEvent
     *
     * Adds an event listener to an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to handle
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event will initiate a capture.
     *   Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.removeEvent
     *
     * Kudos:
     * http://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
     */
    DOM.addEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.attachEvent) return element.attachEvent('on' + event, func);
        else return element.addEventListener(event, func, capture);
    };

    /**
     * ### DOM.removeEvent
     *
     * Removes an event listener from an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to remove
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event was registered
     *   as a capture. Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.addEvent
     */
    DOM.removeEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.detachEvent) return element.detachEvent('on' + event, func);
        else return element.removeEventListener(event, func, capture);
    };

    /**
     * ### DOM.disableBackButton
     *
     * Disables/re-enables backward navigation in history of browsed pages
     *
     * When disabling, it inserts twice the current url.
     *
     * It will still be possible to manually select the uri in the
     * history pane and nagivate to it.
     *
     * @param {boolean} disable Optional. If TRUE disables back button,
     *   if FALSE, re-enables it. Default: TRUE.
     *
     * @return {boolean} The state of the back button (TRUE = disabled),
     *   or NULL if the method is not supported by browser.
     */
    DOM.disableBackButton = (function(isDisabled) {
        return function(disable) {
            disable = 'undefined' === typeof disable ? true : disable;
            if (disable && !isDisabled) {
                if (!history.pushState || !history.go) {
                    node.warn('DOM.disableBackButton: method not ' +
                              'supported by browser.');
                    return null;
                }
                history.pushState(null, null, location.href);
                window.onpopstate = function(event) {
                    history.go(1);
                };
            }
            else if (isDisabled) {
                window.onpopstate = null;
            }
            isDisabled = disable;
            return disable;
        };
    })(false);

    /**
     * ### DOM.playSound
     *
     * Plays a sound
     *
     * @param {various} sound Audio tag or path to audio file to be played
     */
    DOM.playSound = 'undefined' === typeof Audio ?
        function() {
            console.log('JSUS.playSound: Audio tag not supported in your' +
                    ' browser. Cannot play sound.');
        } :
        function(sound) {
        var audio;
        if ('string' === typeof sound) {
            audio = new Audio(sound);
        }
        else if ('object' === typeof sound &&
            'function' === typeof sound.play) {
            audio = sound;
        }
        else {
            throw new TypeError('JSUS.playSound: sound must be string' +
               ' or audio element.');
        }
        audio.play();
    };

    /**
     * ### DOM.onFocusIn
     *
     * Registers a callback to be executed when the page acquires focus
     *
     * @param {function|null} cb Callback executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusIn = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusIn: cb must be function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }

        onFocusChange(cb);
    };

    /**
     * ### DOM.onFocusOut
     *
     * Registers a callback to be executed when the page loses focus
     *
     * @param {function} cb Callback executed if page loses focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusOut = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusOut: cb must be ' +
                                'function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }
        onFocusChange(undefined, cb);
    };


    /**
     * ### DOM.blinkTitle
     *
     * Changes the title of the page in regular intervals
     *
     * Calling the function without any arguments stops the blinking
     * If an array of strings is provided, that array will be cycled through.
     * If a signle string is provided, the title will alternate between '!!!'
     *   and that string.
     *
     * @param {mixed} titles New title to blink
     * @param {object} options Optional. Configuration object.
     *   Accepted values and default in parenthesis:
     *
     *     - stopOnFocus (false): Stop blinking if user switched to tab
     *     - stopOnClick (false): Stop blinking if user clicks on the
     *         specified element
     *     - finalTitle (document.title): Title to set after blinking is done
     *     - repeatFor (undefined): Show each element in titles at most
     *         N times -- might be stopped earlier by other events.
     *     - startOnBlur(false): Start blinking if user switches
     *          away from tab
     *     - period (1000) How much time between two blinking texts in the title
     *
     * @return {function|null} A function to clear the blinking of texts,
     *    or NULL, if the interval was not created yet (e.g. with startOnBlur
     *    option), or just destroyed.
     */
    DOM.blinkTitle = (function(id) {
        var clearBlinkInterval, finalTitle, elem;
        clearBlinkInterval = function(opts) {
            clearInterval(id);
            id = null;
            if (elem) {
                elem.removeEventListener('click', clearBlinkInterval);
                elem = null;
            }
            if (finalTitle) {
                document.title = finalTitle;
                finalTitle = null;
            }
        };
        return function(titles, options) {
            var period, where, rotation;
            var rotationId, nRepeats;

            if (null !== id) clearBlinkInterval();
            if ('undefined' === typeof titles) return null;

            where = 'JSUS.blinkTitle: ';
            options = options || {};

            // Option finalTitle.
            if ('undefined' === typeof options.finalTitle) {
                finalTitle = document.title;
            }
            else if ('string' === typeof options.finalTitle) {
                finalTitle = options.finalTitle;
            }
            else {
                throw new TypeError(where + 'options.finalTitle must be ' +
                                    'string or undefined. Found: ' +
                                    options.finalTitle);
            }

            // Option repeatFor.
            if ('undefined' !== typeof options.repeatFor) {
                nRepeats = JSUS.isInt(options.repeatFor, 0);
                if (false === nRepeats) {
                    throw new TypeError(where + 'options.repeatFor must be ' +
                                        'a positive integer. Found: ' +
                                        options.repeatFor);
                }
            }

            // Option stopOnFocus.
            if (options.stopOnFocus) {
                JSUS.onFocusIn(function() {
                    clearBlinkInterval();
                    onFocusChange(null, null);
                });
            }

            // Option stopOnClick.
            if ('undefined' !== typeof options.stopOnClick) {
                if ('object' !== typeof options.stopOnClick ||
                    !options.stopOnClick.addEventListener) {

                    throw new TypeError(where + 'options.stopOnClick must be ' +
                                        'an HTML element with method ' +
                                        'addEventListener. Found: ' +
                                        options.stopOnClick);
                }
                elem = options.stopOnClick;
                elem.addEventListener('click', clearBlinkInterval);
            }

            // Option startOnBlur.
            if (options.startOnBlur) {
                options.startOnBlur = null;
                JSUS.onFocusOut(function() {
                    JSUS.blinkTitle(titles, options);
                });
                return null;
            }

            // Prepare the rotation.
            if ('string' === typeof titles) {
                titles = [titles, '!!!'];
            }
            else if (!JSUS.isArray(titles)) {
                throw new TypeError(where + 'titles must be string, ' +
                                    'array of strings or undefined.');
            }
            rotationId = 0;
            period = options.period || 1000;
            // Function to be executed every period.
            rotation = function() {
                changeTitle(titles[rotationId]);
                rotationId = (rotationId+1) % titles.length;
                // Control the number of times it should be cycled through.
                if ('number' === typeof nRepeats) {
                    if (rotationId === 0) {
                        nRepeats--;
                        if (nRepeats === 0) clearBlinkInterval();
                    }
                }
            };
            // Perform first rotation right now.
            rotation();
            id = setInterval(rotation, period);

            // Return clear function.
            return clearBlinkInterval;
        };
    })(null);

    /**
     * ### DOM.cookieSupport
     *
     * Tests for cookie support
     *
     * @return {boolean|null} The type of support for cookies. Values:
     *
     *   - null: no cookies
     *   - false: only session cookies
     *   - true: session cookies and persistent cookies (although
     *       the browser might clear them on exit)
     *
     * Kudos: http://stackoverflow.com/questions/2167310/
     *        how-to-show-a-message-only-if-cookies-are-disabled-in-browser
     */
    DOM.cookieSupport = function() {
        var c, persist;
        persist = true;
        do {
            c = 'gCStest=' + Math.floor(Math.random()*100000000);
            document.cookie = persist ? c +
                ';expires=Tue, 01-Jan-2030 00:00:00 GMT' : c;

            if (document.cookie.indexOf(c) !== -1) {
                document.cookie= c + ';expires=Sat, 01-Jan-2000 00:00:00 GMT';
                return persist;
            }
        } while (!(persist = !persist));

        return null;
    };

    /**
     * ### DOM.viewportSize
     *
     * Returns the current size of the viewport in pixels
     *
     * The viewport's size is the actual visible part of the browser's
     * window. This excludes, for example, the area occupied by the
     * JavaScript console.
     *
     * @param {string} dim Optional. Controls the return value ('x', or 'y')
     *
     * @return {object|number} An object containing x and y property, or
     *   number specifying the value for x or y
     *
     * Kudos: http://stackoverflow.com/questions/3437786/
     *        get-the-size-of-the-screen-current-web-page-and-browser-window
     */
    DOM.viewportSize = function(dim) {
        var w, d, e, g, x, y;
        if (dim && dim !== 'x' && dim !== 'y') {
            throw new TypeError('DOM.viewportSize: dim must be "x","y" or ' +
                                'undefined. Found: ' + dim);
        }
        w = window;
        d = document;
        e = d.documentElement;
        g = d.getElementsByTagName('body')[0];
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        return !dim ? {x: x, y: y} : dim === 'x' ? x : y;
    };

    // ## Helper methods

    /**
     * ### onFocusChange
     *
     * Helper function for DOM.onFocusIn and DOM.onFocusOut (cross-browser)
     *
     * Expects only one callback, either inCb, or outCb.
     *
     * @param {function|null} inCb Optional. Executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {function|null} outCb Optional. Executed if page loses focus,
     *   or NULL, to delete an existing callback.
     *
     * Kudos: http://stackoverflow.com/questions/1060008/
     *   is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
     *
     * @see http://www.w3.org/TR/page-visibility/
     */
    onFocusChange = (function(document) {
        var inFocusCb, outFocusCb, event, hidden, evtMap;

        if (!document) {
            return function() {
                JSUS.log('onFocusChange: no document detected.');
                return;
            };
        }

        if ('hidden' in document) {
            hidden = 'hidden';
            event = 'visibilitychange';
        }
        else if ('mozHidden' in document) {
            hidden = 'mozHidden';
            event = 'mozvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            hidden = 'webkitHidden';
            event = 'webkitvisibilitychange';
        }
        else if ('msHidden' in document) {
            hidden = 'msHidden';
            event = 'msvisibilitychange';
        }

        evtMap = {
            focus: true, focusin: true, pageshow: true,
            blur: false, focusout: false, pagehide: false
        };

        function onchange(evt) {
            var isHidden;
            evt = evt || window.event;
            // If event is defined as one from event Map.
            if (evt.type in evtMap) isHidden = evtMap[evt.type];
            // Or use the hidden property.
            else isHidden = this[hidden] ? true : false;
            // Call the callback, if defined.
            if (!isHidden) { if (inFocusCb) inFocusCb(); }
            else { if (outFocusCb) outFocusCb(); }
        }

        return function(inCb, outCb) {
            var onchangeCb;

            if ('undefined' !== typeof inCb) inFocusCb = inCb;
            else outFocusCb = outCb;

            onchangeCb = !inFocusCb && !outFocusCb ? null : onchange;

            // Visibility standard detected.
            if (event) {
                if (onchangeCb) document.addEventListener(event, onchange);
                else document.removeEventListener(event, onchange);
            }
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchangeCb;
            }
            // All others.
            else {
                window.onpageshow = window.onpagehide
                    = window.onfocus = window.onblur = onchangeCb;
            }
        };
    })('undefined' !== typeof document ? document : null);

    /**
     * ### changeTitle
     *
     * Changes title of page
     *
     * @param {string} title New title of the page
     */
    changeTitle = function(title) {
        if ('string' === typeof title) {
            document.title = title;
        }
        else {
            throw new TypeError('JSUS.changeTitle: title must be string. ' +
                                'Found: ' + title);
        }
    };

    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # EVAL
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Evaluation of strings as JavaScript commands
 */
(function(JSUS) {

    "use strict";

    function EVAL() {}

    /**
     * ## EVAL.eval
     *
     * Cross-browser eval function with context.
     *
     * If no context is passed a reference, `this` is used.
     *
     * In old IEs it will use _window.execScript_ instead.
     *
     * @param {string} str The command to executes
     * @param {object} context Optional. Execution context. Defaults, `this`
     *
     * @return {mixed} The return value of the executed commands
     *
     * @see eval
     * @see execScript
     * @see JSON.parse
     */
    EVAL.eval = function(str, context) {
        var func;
        if (!str) return;
        context = context || this;
        // Eval must be called indirectly
        // i.e. eval.call is not possible
        func = function(str) {
            // TODO: Filter str.
            str = '(' + str + ')';
            if ('undefined' !== typeof window && window.execScript) {
                // Notice: execScript doesn’t return anything.
                window.execScript('__my_eval__ = ' + str);
                return __my_eval__;
            }
            else {
                return eval(str);
            }
        };
        return func.call(context, str);
    };

    JSUS.extend(EVAL);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # FS
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to file system operations.
 *
 * TODO: see if we need to keep this file at all.
 *
 * @see http://nodejs.org/api/fs.html
 * @see https://github.com/jprichardson/node-fs-extra
 * @see https://github.com/substack/node-resolve
 */
(function(JSUS) {

    "use strict";

    if (!JSUS.isNodeJS()){
        JSUS.log('Cannot load JSUS.FS outside of Node.JS.');
        return false;
    }

    var resolve = require('resolve'),
    path = require('path'),
    fs = require('fs')


    function FS() {}

    /**
     * ## FS.existsSync
     *
     * Backward-compatible version of fs.existsSync
     */
    FS.existsSync = ('undefined' === typeof fs.existsSync) ?
        path.existsSync : fs.existsSync;


    /**
     * ## FS.resolveModuleDir
     *
     * Resolves the root directory of a module
     *
     * Npm does not install a dependency if the same module
     * is available in a parent folder. This method returns
     * the full path of the root directory of the specified
     * module as installed by npm.
     *
     * Trailing slash is added.
     *
     * @param {string} module The name of the module
     * @param {string} basedir Optional. The basedir from which to start
     *   searching
     *
     * @return {string} The path of the root directory of the module
     *
     * @see https://github.com/substack/node-resolve
     */
    FS.resolveModuleDir = function(module, basedir) {
        var str, stop;
        if ('string' !== typeof module) {
            throw new TypeError('FS.resolveModuleDir: module must be ' +
                                'string. Found: ' + module);
        }
        if (basedir && 'string' !== typeof basedir) {
            throw new TypeError('FS.resolveModuleDir: basedir must be ' +
                                'string or undefined. Found: ' + basedir);
        }
        // Added this line because it might fail.
        if (module === 'JSUS') return path.resolve(__dirname, '..') + '/';
        str = resolve.sync(module, {basedir: basedir || __dirname});
        stop = str.indexOf(module) + module.length;
        return str.substr(0, stop) + '/';
    };

    /**
     * ## FS.deleteIfExists
     *
     * Deletes a file or directory
     *
     * Returns false if the file does not exist.
     *
     * @param {string} file The path to the file or directory
     * @param {function} cb Optional. A callback to execute after successful
     *   file deletion
     *
     * @return {boolean} TRUE, if file is found. An error can still occurs
     *   during async removal
     *
     * @see FS.cleanDir
     */
    FS.deleteIfExists = function(file, cb) {
        var stats;
        if (!FS.existsSync(file)) {
            return false;
        }
        stats = fs.lstatSync(file);
        if (stats.isDirectory()) {
            fs.rmdir(file, function(err) {
                if (err) throw err;
                if (cb) cb();
            });
        }
        else {
            fs.unlink(file, function(err) {
                if (err) throw err;
                if (cb) cb();
            });
        }
        return true;
    };

    /**
     * ## FS.cleanDir
     *
     * Removes all files from a target directory
     *
     * It is possible to specify an extension as second parameter.
     * In such case, only file with that extension will be removed.
     * The '.' (dot) must be included as part of the extension.
     *
     *
     * @param {string} dir The directory to clean
     * @param {string} ext Optional. If set, only files with this extension
     *   will be removed
     * @param {function} cb Optional. A callback function to call if
     *   no error is raised
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see FS.deleteIfExists
     */
    FS.cleanDir = function(dir, ext, cb) {
        var filterFunc;
        if (!dir) {
            JSUS.log('You must specify a directory to clean.');
            return false;
        }
        if (ext) {
            filterFunc = function(file) {
                return path.extname(file) ===  ext;
            };
        }
        else {
            filterFunc = function() {
                return true;
            };
        }

        if (dir[dir.length] !== '/') dir = dir + '/';

        fs.readdir(dir, function(err, files) {
            var asq, mycb;
            if (err) {
                JSUS.log(err);
                return;
            }
            // Create async queue if a callback was specified.
            if (cb) asq = JSUS.getQueue();
            // Create a nested callback for the async queue, if necessary.

            files.filter(filterFunc).forEach(function(file) {
                if (cb) {
                    asq.add(file);
                    mycb = asq.getRemoveCb(file);
                }
                JSUS.deleteIfExists(dir + file, mycb);
            });

            if (cb) {
                asq.onReady(cb);
            }
        });

        return true;
    };

    /**
     * ## FS.copyFromDir
     *
     * Copies all files from a source directory to a destination
     * directory.
     *
     * It is possible to specify an extension as second parameter (e.g. '.js').
     * In such case, only file with that extension will be copied.
     *
     * Warning! If an extension filter is not specified, and if subdirectories
     * are found, an error will occur.
     *
     * @param {string} dirIn The source directory
     * @param {string} dirOut The destination directory
     * @param {string} ext Optional. If set, only files with this extension
     *   will be copied
     * @param {function} cb Optional. A callback function to call if
     *   no error is raised
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see FS.copyFile
     */
    FS.copyFromDir = function(dirIn, dirOut, ext, cb) {
        var i, dir, dirs, stats;
        if (!dirIn) {
            JSUS.log('You must specify a source directory.');
            return false;
        }
        if (!dirOut) {
            JSUS.log('You must specify a destination directory.');
            return false;
        }

        dirOut = path.resolve(dirOut) + '/';
        dirs = [dirIn, dirOut];

        for (i = 0; i < 2; i++) {
            dir = dirs[i];
            if (!FS.existsSync(dir)) {
                console.log(dir + ' does not exist.');
                return false;
            }

            stats = fs.lstatSync(dir);
            if (!stats.isDirectory()) {
                console.log(dir + ' is not a directory.');
                return false;
            }
        }

        fs.readdir(dirIn, function(err, files) {
            var asq, i, mycb;
            if (err) {
                JSUS.log(err);
                throw new Error();
            }
            // Create async queue if a callback was specified.
            if (cb) asq = JSUS.getQueue();
            for (i in files) {
                if (ext && path.extname(files[i]) !== ext) {
                    continue;
                }
                // Create a nested callback for the asq, if necessary.
                if (cb) {
                    asq.add(i);
                    mycb = asq.getRemoveCb(i);
                }
                FS.copyFile(dirIn + files[i], dirOut + files[i], mycb);
            }

            if (cb) {
                asq.onReady(cb);
            }
        });

        return true;
    };

    /**
     * ## FS.copyFile
     *
     * Copies a file into another path
     *
     * @param {string} srcFile The source file
     * @param {string} destFile The destination file
     * @param {function} cb Optional. If set, the callback will be executed
     *   upon success
     *
     * @return {boolean} TRUE, if the operation is successful
     *
     * @see
     *   https://github.com/jprichardson/node-fs-extra/blob/master/lib/copy.js
     */
    FS.copyFile = function(srcFile, destFile, cb) {
        var fdr, fdw;
        fdr = fs.createReadStream(srcFile);
        fdw = fs.createWriteStream(destFile);
        fdr.on('end', function() {
            if (cb) return cb(null);
        });
        return fdr.pipe(fdw);
    };

    JSUS.extend(FS);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # OBJ
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Collection of static functions to manipulate JavaScript objects
 */
(function(JSUS) {

    "use strict";

    function OBJ() {}

    var compatibility = null;

    if ('undefined' !== typeof JSUS.compatibility) {
        compatibility = JSUS.compatibility();
    }

    /**
     * ## OBJ.createObj
     *
     * Polyfill for Object.create (when missing)
     */
    OBJ.createObj = (function() {
        // From MDN Object.create (Polyfill)
        if (typeof Object.create !== 'function') {
            // Production steps of ECMA-262, Edition 5, 15.2.3.5
            // Reference: http://es5.github.io/#x15.2.3.5
            return (function() {
                // To save on memory, use a shared constructor
                function Temp() {}

                // make a safe reference to Object.prototype.hasOwnProperty
                var hasOwn = Object.prototype.hasOwnProperty;

                return function(O) {
                    // 1. If Type(O) is not Object or Null
                    if (typeof O != 'object') {
                        throw new TypeError('Object prototype may only ' +
                                            'be an Object or null');
                    }

                    // 2. Let obj be the result of creating a new object as if
                    //    by the expression new Object() where Object is the
                    //    standard built-in constructor with that name
                    // 3. Set the [[Prototype]] internal property of obj to O.
                    Temp.prototype = O;
                    var obj = new Temp();
                    Temp.prototype = null;

                    // 4. If the argument Properties is present and not
                    //    undefined, add own properties to obj as if by calling
                    //    the standard built-in function Object.defineProperties
                    //    with arguments obj and Properties.
                    if (arguments.length > 1) {
                        // Object.defineProperties does ToObject on
                        // its first argument.
                        var Properties = new Object(arguments[1]);
                        for (var prop in Properties) {
                            if (hasOwn.call(Properties, prop)) {
                                obj[prop] = Properties[prop];
                            }
                        }
                    }

                    // 5. Return obj
                    return obj;
                };
            })();
        }
        return Object.create;
    })();

    /**
     * ## OBJ.equals
     *
     * Checks for deep equality between two objects, strings or primitive types
     *
     * All nested properties are checked, and if they differ in at least
     * one returns FALSE, otherwise TRUE.
     *
     * Takes care of comparing the following special cases:
     *
     * - undefined
     * - null
     * - NaN
     * - Infinity
     * - {}
     * - falsy values
     *
     * @param {object} o1 The first object
     * @param {object} o2 The second object
     *
     * @return {boolean} TRUE if the objects are deeply equal
     */
    OBJ.equals = function(o1, o2) {
        var type1, type2, primitives, p;
        type1 = typeof o1;
        type2 = typeof o2;

        if (type1 !== type2) return false;

        if ('undefined' === type1 || 'undefined' === type2) {
            return (o1 === o2);
        }
        if (o1 === null || o2 === null) {
            return (o1 === o2);
        }
        if (('number' === type1 && isNaN(o1)) &&
            ('number' === type2 && isNaN(o2))) {
            return (isNaN(o1) && isNaN(o2));
        }

        // Check whether arguments are not objects
        primitives = {number: '', string: '', boolean: ''};
        if (type1 in primitives) {
            return o1 === o2;
        }

        if ('function' === type1) {
            return o1.toString() === o2.toString();
        }

        for (p in o1) {
            if (o1.hasOwnProperty(p)) {

                if ('undefined' === typeof o2[p] &&
                    'undefined' !== typeof o1[p]) return false;

                if (!o2[p] && o1[p]) return false;

                if ('function' === typeof o1[p]) {
                    if (o1[p].toString() !== o2[p].toString()) return false;
                }
                else
                    if (!OBJ.equals(o1[p], o2[p])) return false;
            }
        }

        // Check whether o2 has extra properties
        // TODO: improve, some properties have already been checked!
        for (p in o2) {
            if (o2.hasOwnProperty(p)) {
                if ('undefined' === typeof o1[p] &&
                    'undefined' !== typeof o2[p]) return false;

                if (!o1[p] && o2[p]) return false;
            }
        }

        return true;
    };

    /**
     * ## OBJ.isEmpty
     *
     * Returns TRUE if an object has no own properties (supports other types)
     *
     * Map of input-type and return values:
     *
     *   - undefined: TRUE
     *   - null: TRUE
     *   - string: TRUE if string === '' or if contains only spaces
     *   - number: FALSE if different from 0
     *   - function: FALSE
     *   - array: TRUE, if it contains zero elements
     *   - object: TRUE, if it does not contain **own** properties
     *
     * Notice: for object, it is much faster than Object.keys(o).length === 0,
     * because it does not pull out all keys. Own properties must be enumerable.
     *
     * @param {mixed} o The object (or other type) to check
     *
     * @return {boolean} TRUE, if the object is empty
     */
    OBJ.isEmpty = function(o) {
        var key;
        if (!o) return true;
        if ('string' === typeof o) return o.trim() === '';
        if ('number' === typeof o) return false;
        if ('function' === typeof o) return false;
        for (key in o) if (o.hasOwnProperty(key)) return false;
        return true;
    };

    /**
     * ## OBJ.size
     *
     * Counts the number of own properties of an object.
     *
     * Prototype chain properties are excluded.
     *
     * @param {object} obj The object to check
     *
     * @return {number} The number of properties in the object
     */
    OBJ.size = OBJ.getListSize = function(obj) {
        var n, key;
        if (!obj) return 0;
        if ('number' === typeof obj) return 0;
        if ('string' === typeof obj) return 0;

        n = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                n++;
            }
        }
        return n;
    };

    /**
     * ## OBJ._obj2Array
     *
     * Explodes an object into an array of keys and values,
     * according to the specified parameters.
     *
     * A fixed level of recursion can be set.
     *
     * @api private
     * @param {object} obj The object to convert in array
     * @param {boolean} keyed TRUE, if also property names should be included.
     *   Defaults, FALSE
     * @param {number} level Optional. The level of recursion.
     *   Defaults, undefined
     *
     * @return {array} The converted object
     */
    OBJ._obj2Array = function(obj, keyed, level, cur_level) {
        var result, key;
        if ('object' !== typeof obj) return [obj];

        if (level) {
            cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }

        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (keyed) result.push(key);
                if ('object' === typeof obj[key]) {
                    result = result.concat(OBJ._obj2Array(obj[key], keyed,
                                                          level, cur_level));
                }
                else {
                    result.push(obj[key]);
                }
            }
        }
        return result;
    };

    /**
     * ## OBJ.obj2Array
     *
     * Converts an object into an array, keys are lost
     *
     * Recursively put the values of the properties of an object into
     * an array and returns it.
     *
     * The level of recursion can be set with the parameter level.
     * By default recursion has no limit, i.e. that the whole object
     * gets totally unfolded into an array.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults,
     *   undefined
     *
     * @return {array} The converted object
     *
     * @see OBJ._obj2Array
     * @see OBJ.obj2KeyedArray
     */
    OBJ.obj2Array = function(obj, level) {
        return OBJ._obj2Array(obj, false, level);
    };

    /**
     * ## OBJ.obj2KeyedArray
     *
     * Converts an object into array, keys are preserved
     *
     * Creates an array containing all keys and values of an object and
     * returns it.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults,
     *   undefined
     *
     * @return {array} The converted object
     *
     * @see OBJ.obj2Array
     */
    OBJ.obj2KeyedArray = OBJ.obj2KeyArray = function(obj, level) {
        return OBJ._obj2Array(obj, true, level);
    };

    /**
     * ## OBJ.obj2QueryString
     *
     * Creates a querystring with the key-value pairs of the given object.
     *
     * @param {object} obj The object to convert
     *
     * @return {string} The created querystring
     *
     * Kudos:
     * @see http://stackoverflow.com/a/1714899/3347292
     */
    OBJ.obj2QueryString = function(obj) {
        var str;
        var key;

        if ('object' !== typeof obj) {
            throw new TypeError(
                    'JSUS.objectToQueryString: obj must be object.');
        }

        str = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key) + '=' +
                         encodeURIComponent(obj[key]));
            }
        }

        return '?' + str.join('&');
    };

    /**
     * ## OBJ.keys
     *
     * Scans an object an returns all the keys of the properties,
     * into an array.
     *
     * The second paramter controls the level of nested objects
     * to be evaluated. Defaults 0 (nested properties are skipped).
     *
     * @param {object} obj The object from which extract the keys
     * @param {number} level Optional. The level of recursion. Defaults 0
     *
     * @return {array} The array containing the extracted keys
     *
     * @see Object.keys
     */
    OBJ.keys = OBJ.objGetAllKeys = function(obj, level, curLevel) {
        var result, key;
        if (!obj) return [];
        level = 'number' === typeof level && level >= 0 ? level : 0;
        curLevel = 'number' === typeof curLevel && curLevel >= 0 ? curLevel : 0;
        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(key);
                if (curLevel < level) {
                    if ('object' === typeof obj[key]) {
                        result = result.concat(OBJ.objGetAllKeys(obj[key],
                                                                 (curLevel+1)));
                    }
                }
            }
        }
        return result;
    };

    /**
     * ## OBJ.implode
     *
     * Separates each property into a new object and returns them into an array
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c: {a:1}, e:5 };
     * OBJ.implode(a); // [{b:2}, {c:{a:1}}, {e:5}]
     * ```
     *
     * @param {object} obj The object to implode
     *
     * @return {array} The array containing all the imploded properties
     */
    OBJ.implode = OBJ.implodeObj = function(obj) {
        var result, key, o;
        if (!obj) return [];
        result = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                o = {};
                o[key] = obj[key];
                result.push(o);
            }
        }
        return result;
    };

    /**
     * ## OBJ.clone
     *
     * Creates a perfect copy of the object passed as parameter
     *
     * Recursively scans all the properties of the object to clone.
     * Properties of the prototype chain are copied as well.
     *
     * Primitive types and special values are returned as they are.
     *
     * @param {object} obj The object to clone
     *
     * @return {object} The clone of the object
     */
    OBJ.clone = function(obj) {
        var clone, i, value;
        if (!obj) return obj;
        if ('number' === typeof obj) return obj;
        if ('string' === typeof obj) return obj;
        if ('boolean' === typeof obj) return obj;
        // NaN and +-Infinity are numbers, so no check is necessary.

        if ('function' === typeof obj) {
            clone = function() {
                var len, args;
                len = arguments.length;
                if (!len) return obj.call(clone);
                else if (len === 1) return obj.call(clone, arguments[0]);
                else if (len === 2) {
                    return obj.call(clone, arguments[0], arguments[1]);
                }
                else {
                    args = new Array(len);
                    for (i = 0; i < len; i++) {
                        args[i] = arguments[i];
                    }
                    return obj.apply(clone, args);
                }
            };
        }
        else {
            clone = Object.prototype.toString.call(obj) === '[object Array]' ?
                [] : {};
        }
        for (i in obj) {
            // It is not NULL and it is an object.
            // Even if it is an array we need to use CLONE,
            // because `slice()` does not clone arrays of objects.
            if (obj[i] && 'object' === typeof obj[i]) {
                value = OBJ.clone(obj[i]);
            }
            else {
                value = obj[i];
            }

            if (obj.hasOwnProperty(i)) {
                clone[i] = value;
            }
            else {
                // We know if object.defineProperty is available.
                if (compatibility && compatibility.defineProperty) {
                    Object.defineProperty(clone, i, {
                        value: value,
                        writable: true,
                        configurable: true
                    });
                }
                else {
                    setProp(clone, i, value);
                }
            }
        }
        return clone;
    };

    function setProp(clone, i, value) {
        try {
            Object.defineProperty(clone, i, {
                value: value,
                writable: true,
                configurable: true
            });
        }
        catch(e) {
            clone[i] = value;
        }
    }


    /**
     * ## OBJ.classClone
     *
     * Creates a copy (keeping class) of the object passed as parameter
     *
     * Recursively scans all the properties of the object to clone.
     * The clone is an instance of the type of obj.
     *
     * @param {object} obj The object to clone
     * @param {Number} depth how deep the copy should be
     *
     * @return {object} The clone of the object
     */
    OBJ.classClone = function(obj, depth) {
        var clone, i;
        if (depth === 0) {
            return obj;
        }

        if (obj && 'object' === typeof obj) {
            clone = Object.prototype.toString.call(obj) === '[object Array]' ?
                [] : JSUS.createObj(obj.constructor.prototype);

            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i] && 'object' === typeof obj[i]) {
                        clone[i] = JSUS.classClone(obj[i], depth - 1);
                    }
                    else {
                        clone[i] = obj[i];
                    }
                }
            }
            return clone;
        }
        else {
            return JSUS.clone(obj);
        }
    };

    /**
     * ## OBJ.join
     *
     * Performs a *left* join on the keys of two objects
     *
     * Creates a copy of obj1, and in case keys overlap
     * between obj1 and obj2, the values from obj2 are taken.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, e:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.join(a, b); // { b:2, c:100, e:5 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     *
     * @return {object} The joined object
     *
     * @see OBJ.merge
     */
    OBJ.join = function(obj1, obj2) {
        var clone, i;
        clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (i in clone) {
            if (clone.hasOwnProperty(i)) {
                if ('undefined' !== typeof obj2[i]) {
                    if ('object' === typeof obj2[i]) {
                        clone[i] = OBJ.join(clone[i], obj2[i]);
                    } else {
                        clone[i] = obj2[i];
                    }
                }
            }
        }
        return clone;
    };

    /**
     * ## OBJ.merge
     *
     * Merges two objects in one
     *
     * In case keys overlap the values from obj2 are taken.
     *
     * Only own properties are copied.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.merge(a, b); // { a: 10, b: 2, c: 100, d: 4 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     *
     * @return {object} The merged object
     *
     * @see OBJ.join
     * @see OBJ.mergeOnKey
     */
    OBJ.merge = function(obj1, obj2) {
        var clone, i;
        // Checking before starting the algorithm
        if (!obj1 && !obj2) return false;
        if (!obj1) return OBJ.clone(obj2);
        if (!obj2) return OBJ.clone(obj1);

        clone = OBJ.clone(obj1);
        for (i in obj2) {

            if (obj2.hasOwnProperty(i)) {
                // it is an object and it is not NULL
                if (obj2[i] && 'object' === typeof obj2[i]) {
                    // If we are merging an object into
                    // a non-object, we need to cast the
                    // type of obj1
                    if ('object' !== typeof clone[i]) {
                        if (Object.prototype.toString.call(obj2[i]) ===
                            '[object Array]') {

                            clone[i] = [];
                        }
                        else {
                            clone[i] = {};
                        }
                    }
                    clone[i] = OBJ.merge(clone[i], obj2[i]);
                }
                else {
                    clone[i] = obj2[i];
                }
            }
        }
        return clone;
    };

    /**
     * ## OBJ.mixin
     *
     * Adds all the properties of obj2 into obj1
     *
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     *
     * @return {object} obj1
     */
    OBJ.mixin = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            obj1[i] = obj2[i];
        }
        return obj1;
    };

    /**
     * ## OBJ.mixout
     *
     * Copies only non-overlapping properties from obj2 to obj1
     *
     * Check only if a property is defined, not its value.
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     *
     * @return {object} obj1
     */
    OBJ.mixout = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            if ('undefined' === typeof obj1[i]) obj1[i] = obj2[i];
        }
        return obj1;
    };

    /**
     * ## OBJ.mixcommon
     *
     * Copies only overlapping properties from obj2 to obj1
     *
     * Check only if a property is defined, not its value.
     * Original object is modified.
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     *
     * @return {object} obj1
     */
    OBJ.mixcommon = function(obj1, obj2) {
        var i;
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;
        for (i in obj2) {
            if ('undefined' !== typeof obj1[i]) obj1[i] = obj2[i];
        }
        return obj1;
    };

    /**
     * ## OBJ.mergeOnKey
     *
     * Merges the properties of obj2 into a new property named 'key' in obj1.
     *
     * Returns a new object, the original ones are not modified.
     *
     * This method is useful when we want to merge into a larger
     * configuration (e.g. with properties min, max, value) object, another one
     * that contains just a subset of properties (e.g. value).
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     * @param {string} key The name of property under which the second object
     *   will be merged
     *
     * @return {object} The merged object
     *
     * @see OBJ.merge
     */
    OBJ.mergeOnKey = function(obj1, obj2, key) {
        var clone, i;
        clone = OBJ.clone(obj1);
        if (!obj2 || !key) return clone;
        for (i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if (!clone[i] || 'object' !== typeof clone[i]) {
                    clone[i] = {};
                }
                clone[i][key] = obj2[i];
            }
        }
        return clone;
    };

    /**
     * ## OBJ.subobj
     *
     * Creates a copy of an object containing only the properties
     * passed as second parameter
     *
     * The parameter select can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be used first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} select The selection of properties to extract
     *
     * @return {object} The subobject with the properties from the parent
     *
     * @see OBJ.getNestedValue
     */
    OBJ.subobj = function(o, select) {
        var out, i, key;
        if (!o) return false;
        out = {};
        if (!select) return out;
        if (!(select instanceof Array)) select = [select];
        for (i=0; i < select.length; i++) {
            key = select[i];
            if (o.hasOwnProperty(key)) {
                out[key] = o[key];
            }
            else if (OBJ.hasOwnNestedProperty(key, o)) {
                OBJ.setNestedValue(key, OBJ.getNestedValue(key, o), out);
            }
        }
        return out;
    };

    /**
     * ## OBJ.skim
     *
     * Creates a copy of an object with some of the properties removed
     *
     * The parameter `remove` can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be deleted first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} remove The selection of properties to remove
     *
     * @return {object} The subobject with the properties from the parent
     *
     * @see OBJ.getNestedValue
     */
    OBJ.skim = function(o, remove) {
        var out, i;
        if (!o) return false;
        out = OBJ.clone(o);
        if (!remove) return out;
        if (!(remove instanceof Array)) remove = [remove];
        for (i = 0; i < remove.length; i++) {
            if (out.hasOwnProperty(i)) {
                delete out[i];
            }
            else {
                OBJ.deleteNestedKey(remove[i], out);
            }
        }
        return out;
    };


    /**
     * ## OBJ.setNestedValue
     *
     * Sets the value of a nested property of an object and returns it.
     *
     * If the object is not passed a new one is created.
     * If the nested property is not existing, a new one is created.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * @param {string} str The path to the value
     * @param {mixed} value The value to set
     *
     * @return {object|boolean} The modified object, or FALSE if error
     *   occurrs
     *
     * @see OBJ.getNestedValue
     * @see OBJ.deleteNestedKey
     */
    OBJ.setNestedValue = function(str, value, obj) {
        var keys, k;
        if (!str) {
            JSUS.log('Cannot set value of undefined property', 'ERR');
            return false;
        }
        obj = ('object' === typeof obj) ? obj : {};
        keys = str.split('.');
        if (keys.length === 1) {
            obj[str] = value;
            return obj;
        }
        k = keys.shift();
        obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]);
        return obj;
    };

    /**
     * ## OBJ.getNestedValue
     *
     * Returns the value of a property of an object, as defined
     * by a path string.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * Returns undefined if the nested property does not exist.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.getNestedValue('b.a', o); // 2
     * ```
     *
     * @param {string} str The path to the value
     * @param {object} obj The object from which extract the value
     *
     * @return {mixed} The extracted value
     *
     * @see OBJ.setNestedValue
     * @see OBJ.deleteNestedKey
     */
    OBJ.getNestedValue = function(str, obj) {
        var keys, k;
        if (!obj) return;
        keys = str.split('.');
        if (keys.length === 1) {
            return obj[str];
        }
        k = keys.shift();
        return OBJ.getNestedValue(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.deleteNestedKey
     *
     * Deletes a property from an object, as defined by a path string
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.deleteNestedKey('b.a', o); // { a:1, b: {} }
     * ```
     *
     * @param {string} str The path string
     * @param {object} obj The object from which deleting a property
     * @param {boolean} TRUE, if the property was existing, and then deleted
     *
     * @see OBJ.setNestedValue
     * @see OBJ.getNestedValue
     */
    OBJ.deleteNestedKey = function(str, obj) {
        var keys, k;
        if (!obj) return;
        keys = str.split('.');
        if (keys.length === 1) {
            delete obj[str];
            return true;
        }
        k = keys.shift();
        if ('undefined' === typeof obj[k]) {
            return false;
        }
        return OBJ.deleteNestedKey(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.hasOwnNestedProperty
     *
     * Returns TRUE if a (nested) property exists
     *
     * Use '.' to specify a nested property.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.hasOwnNestedProperty('b.a', o); // TRUE
     * ```
     *
     * @param {string} str The path of the (nested) property
     * @param {object} obj The object to test
     *
     * @return {boolean} TRUE, if the (nested) property exists
     */
    OBJ.hasOwnNestedProperty = function(str, obj) {
        var keys, k;
        if (!obj) return false;
        keys = str.split('.');
        if (keys.length === 1) {
            return obj.hasOwnProperty(str);
        }
        k = keys.shift();
        return OBJ.hasOwnNestedProperty(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.split
     *
     * Splits an object along a specified dimension
     *
     * All fragments are returned in an array (as copies).
     *
     * It creates as many new objects as the number of properties
     * contained in the specified dimension. E.g.
     *
     * ```javascript
     *  var o = { a: 1,
     *            b: {c: 2,
     *                d: 3
     *            },
     *            e: 4
     *  };
     *
     *  o = OBJ.split(o, 'b');
     *
     *  // o becomes:
     *
     *  [{ a: 1,
     *     b: {c: 2},
     *     e: 4
     *  },
     *  { a: 1,
     *    b: {d: 3},
     *    e: 4
     *  }];
     * ```
     *
     * @param {object} o The object to split
     * @param {string} key The name of the property to split
     * @param {number} l Optional. The recursion level. Default: 1.
     * @param {boolean} positionAsKey Optional. If TRUE, the position
     *   of an element in the array to split will be used as key.
     *
     * @return {array} A list of copies of the object with split values
     */
    OBJ.split = (function() {
        var makeClone, splitValue;
        var model, level, _key, posAsKeys;

        makeClone = function(value, out, keys) {
            var i, len, tmp, copy;
            copy = JSUS.clone(model);

            switch(keys.length) {
            case 0:
                copy[_key] = JSUS.clone(value);
                break;
            case 1:
                copy[_key][keys[0]] = JSUS.clone(value);
                break;
            case 2:
                copy[_key][keys[0]] = {};
                copy[_key][keys[0]][keys[1]] = JSUS.clone(value);
                break;
            default:
                i = -1, len = keys.length-1;
                tmp = copy[_key];
                for ( ; ++i < len ; ) {
                    tmp[keys[i]] = {};
                    tmp = tmp[keys[i]];
                }
                tmp[keys[keys.length-1]] = JSUS.clone(value);
            }
            out.push(copy);
            return;
        };

        splitValue = function(value, out, curLevel, keysArray) {
            var i, curPosAsKey;

            // level == 0 means no limit.
            if (level && (curLevel >= level)) {
                makeClone(value, out, keysArray);
            }
            else {

                curPosAsKey = posAsKeys || !JSUS.isArray(value);

                for (i in value) {
                    if (value.hasOwnProperty(i)) {

                        if ('object' === typeof value[i] &&
                            (level && ((curLevel+1) <= level))) {

                            splitValue(value[i], out, (curLevel+1),
                                       curPosAsKey ?
                                       keysArray.concat(i) : keysArray);
                        }
                        else {
                            makeClone(value[i], out, curPosAsKey ?
                                      keysArray.concat(i) : keysArray);
                        }
                    }
                }
            }
        };

        return function(o, key, l, positionAsKey) {
            var out;
            if ('object' !== typeof o) {
                throw new TypeError('JSUS.split: o must be object. Found: ' +
                                    o);
            }
            if ('string' !== typeof key || key.trim() === '') {
                throw new TypeError('JSUS.split: key must a non-empty ' +
                                    'string. Found: ' + key);
            }
            if (l && ('number' !== typeof l || l < 0)) {
                throw new TypeError('JSUS.split: l must a non-negative ' +
                                    'number or undefined. Found: ' + l);
            }
            model = JSUS.clone(o);
            if ('object' !== typeof o[key]) return [model];
            // Init.
            out = [];
            _key = key;
            model[key] = {};
            level = 'undefined' === typeof l ? 1 : l;
            posAsKeys = positionAsKey;
            // Recursively compute split.
            splitValue(o[key], out, 0, []);
            // Cleanup.
            _key = undefined;
            model = undefined;
            level = undefined;
            posAsKeys = undefined;
            // Return.
            return out;
        };
    })();

    /**
     * ## OBJ.melt
     *
     * Creates a new object with the specified combination of
     * properties - values
     *
     * The values are assigned cyclically to the properties, so that
     * they do not need to have the same length. E.g.
     *
     * ```javascript
     *  J.createObj(['a','b','c'], [1,2]); // { a: 1, b: 2, c: 1 }
     * ```
     * @param {array} keys The names of the keys to add to the object
     * @param {array} values The values to associate to the keys
     *
     * @return {object} A new object with keys and values melted together
     */
    OBJ.melt = function(keys, values) {
        var o = {}, valen = values.length;
        for (var i = 0; i < keys.length; i++) {
            o[keys[i]] = values[i % valen];
        }
        return o;
    };

    /**
     * ## OBJ.uniqueKey
     *
     * Creates a random unique key name for a collection
     *
     * User can specify a tentative unique key name, and if already
     * existing an incremental index will be added as suffix to it.
     *
     * Notice: the method does not actually create the key
     * in the object, but it just returns the name.
     *
     * @param {object} obj The collection for which a unique key will be created
     * @param {string} prefixName Optional. A tentative key name. Defaults,
     *   a 15-digit random number
     * @param {number} stop Optional. The number of tries before giving up
     *   searching for a unique key name. Defaults, 1000000.
     *
     * @return {string|undefined} The unique key name, or undefined if it was
     *   not found
     */
    OBJ.uniqueKey = function(obj, prefixName, stop) {
        var name, duplicateCounter;
        if (!obj) {
            JSUS.log('Cannot find unique name in undefined object', 'ERR');
            return;
        }
        duplicateCounter = 1;
        prefixName = '' + (prefixName ||
                           Math.floor(Math.random()*1000000000000000));
        stop = stop || 1000000;
        name = prefixName;
        while (obj[name]) {
            name = prefixName + duplicateCounter;
            duplicateCounter++;
            if (duplicateCounter > stop) {
                return;
            }
        }
        return name;
    };

    /**
     * ## OBJ.augment
     *
     * Pushes the values of the properties of an object into another one
     *
     * User can specifies the subset of keys from both objects
     * that will subject to augmentation. The values of the other keys
     * will not be changed
     *
     * Notice: the method modifies the first input paramteer
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.augment(a, b); // { a: [1, 10], b: [2, 2], c: [3, 100]}
     *
     * OBJ.augment(a, b, ['b', 'c', 'd']);
     * // { a: 1, b: [2, 2], c: [3, 100], d: [4]});
     *
     * ```
     *
     * @param {object} obj1 The object whose properties will be augmented
     * @param {object} obj2 The augmenting object
     * @param {array} key Optional. Array of key names common to both objects
     *   taken as the set of properties to augment
     */
    OBJ.augment = function(obj1, obj2, keys) {
        var i, k;
        keys = keys || OBJ.keys(obj1);

        for (i = 0 ; i < keys.length; i++) {
            k = keys[i];
            if ('undefined' !== typeof obj1[k] &&
                Object.prototype.toString.call(obj1[k]) !== '[object Array]') {
                obj1[k] = [obj1[k]];
            }
            if ('undefined' !== obj2[k]) {
                if (!obj1[k]) obj1[k] = [];
                obj1[k].push(obj2[k]);
            }
        }
    };


    /**
     * ## OBJ.pairwiseWalk
     *
     * Executes a callback on all pairs of  attributes with the same name
     *
     * The results of each callback are aggregated in a new object under the
     * same property name.
     *
     * Does not traverse nested objects, and properties of the prototype
     * are excluded.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, d:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * var sum = function(a,b) {
     *     if ('undefined' !== typeof a) {
     *         return 'undefined' !== typeof b ? a + b : a;
     *     }
     *     return b;
     * };
     * OBJ.pairwiseWalk(a, b, sum); // { a:10, b:4, c:103, d:9 }
     * ```
     *
     * @param {object} o1 The first object
     * @param {object} o2 The second object
     *
     * @return {object} The object aggregating the results
     */
    OBJ.pairwiseWalk = function(o1, o2, cb) {
        var i, out;
        if (!o1 && !o2) return;
        if (!o1) return o2;
        if (!o2) return o1;

        out = {};
        for (i in o1) {
            if (o1.hasOwnProperty(i)) {
                out[i] = o2.hasOwnProperty(i) ? cb(o1[i], o2[i]) : cb(o1[i]);
            }
        }

        for (i in o2) {
            if (o2.hasOwnProperty(i)) {
                if ('undefined' === typeof out[i]) {
                    out[i] = cb(undefined, o2[i]);
                }
            }
        }
        return out;
    };

    /**
     * ## OBJ.getKeyByValue
     *
     * Returns the key/s associated with a specific value
     *
     * Uses OBJ.equals so it can perform complicated comparisons of
     * the value of the keys.
     *
     * Properties of the prototype are not skipped.
     *
     * @param {object} obj The object to search
     * @param {mixed} value The value to match
     * @param {boolean} allKeys Optional. If TRUE, all keys with the
     *   specific value are returned. Default FALSE
     *
     * @return {object} The object aggregating the results
     *
     * @see OBJ.equals
     */
    OBJ.getKeyByValue = function(obj, value, allKeys) {
        var key, out;
        if ('object' !== typeof obj) {
            throw new TypeError('OBJ.getKeyByValue: obj must be object.');
        }
        if (allKeys) out = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key) ) {
                if (OBJ.equals(value, obj[key])) {
                    if (!allKeys) return key;
                    else out.push(key);
                }
            }
        }
        return out;
    };

    JSUS.extend(OBJ);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # PARSE
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Collection of static functions related to parsing strings
 */
(function(JSUS) {

    "use strict";

    function PARSE() {}

    /**
     * ## PARSE.stringify_prefix
     *
     * Prefix used by PARSE.stringify and PARSE.parse
     * to decode strings with special meaning
     *
     * @see PARSE.stringify
     * @see PARSE.parse
     */
    PARSE.stringify_prefix = '!?_';

    PARSE.marker_func = PARSE.stringify_prefix + 'function';
    PARSE.marker_null = PARSE.stringify_prefix + 'null';
    PARSE.marker_und = PARSE.stringify_prefix + 'undefined';
    PARSE.marker_nan = PARSE.stringify_prefix + 'NaN';
    PARSE.marker_inf = PARSE.stringify_prefix + 'Infinity';
    PARSE.marker_minus_inf = PARSE.stringify_prefix + '-Infinity';

    /**
     * ## PARSE.getQueryString
     *
     * Parses current querystring and returns the requested variable.
     *
     * If no variable name is specified, returns the full query string.
     * If requested variable is not found returns false.
     *
     * @param {string} name Optional. If set, returns only the value
     *   associated with this variable
     * @param {string} referer Optional. If set, searches this string
     *
     * @return {string|boolean} The querystring, or a part of it, or FALSE
     *
     * Kudos:
     * @see http://stackoverflow.com/q/901115/3347292
     */
    PARSE.getQueryString = function(name, referer) {
        var regex, results;
        if (referer && 'string' !== typeof referer) {
            throw new TypeError('JSUS.getQueryString: referer must be string ' +
                                'or undefined. Found: ' + referer);
        }
        referer = referer || window.location.search;
        if ('undefined' === typeof name) return referer;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        results = regex.exec(referer);
        return results === null ? false :
            decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /**
     * ## PARSE.tokenize
     *
     * Splits a string in tokens that users can specified as input parameter.
     * Additional options can be specified with the modifiers parameter
     *
     * - limit: An integer that specifies the number of split items
     *     after the split limit will not be included in the array
     *
     * @param {string} str The string to split
     * @param {array} separators Array containing the separators words
     * @param {object} modifiers Optional. Configuration options
     *   for the tokenizing
     *
     * @return {array} Tokens in which the string was split
     */
    PARSE.tokenize = function(str, separators, modifiers) {
        var pattern, regex;
        if (!str) return;
        if (!separators || !separators.length) return [str];
        modifiers = modifiers || {};

        pattern = '[';

        JSUS.each(separators, function(s) {
            if (s === ' ') s = '\\s';

            pattern += s;
        });

        pattern += ']+';

        regex = new RegExp(pattern);
        return str.split(regex, modifiers.limit);
    };

    /**
     * ## PARSE.stringify
     *
     * Stringifies objects, functions, primitive, undefined or null values
     *
     * Makes uses `JSON.stringify` with a special reviver function, that
     * strinfifies also functions, undefined, and null values.
     *
     * A special prefix is prepended to avoid name collisions.
     *
     * @param {mixed} o The value to stringify
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see JSON.stringify
     * @see PARSE.stringify_prefix
     */
    PARSE.stringify = function(o, spaces) {
        return JSON.stringify(o, function(key, value) {
            var type = typeof value;
            if ('function' === type) {
                return PARSE.stringify_prefix + value.toString();
            }

            if ('undefined' === type) return PARSE.marker_und;
            if (value === null) return PARSE.marker_null;
            if ('number' === type && isNaN(value)) return PARSE.marker_nan;
            if (value === Number.POSITIVE_INFINITY) return PARSE.marker_inf;
            if (value === Number.NEGATIVE_INFINITY) {
                return PARSE.marker_minus_inf;
            }

            return value;

        }, spaces);
    };

    /**
     * ## PARSE.stringifyAll
     *
     * Copies all the properties of the prototype before stringifying
     *
     * Notice: The original object is modified!
     *
     * @param {mixed} o The value to stringify
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see PARSE.stringify
     */
    PARSE.stringifyAll = function(o, spaces) {
        var i;
        if ('object' === typeof o) {
            for (i in o) {
                if (!o.hasOwnProperty(i)) {
                    if ('object' === typeof o[i]) {
                        o[i] = PARSE.stringifyAll(o[i]);
                    }
                    else {
                        o[i] = o[i];
                    }
                }
            }
        }
        return PARSE.stringify(o);
    };

    /**
     * ## PARSE.parse
     *
     * Decodes strings in objects and other values
     *
     * Uses `JSON.parse` and then looks  for special strings
     * encoded by `PARSE.stringify`
     *
     * @param {string} str The string to decode
     * @return {mixed} The decoded value
     *
     * @see JSON.parse
     * @see PARSE.stringify_prefix
     */
    PARSE.parse = (function() {

        var len_prefix = PARSE.stringify_prefix.length,
            len_func = PARSE.marker_func.length,
            len_null = PARSE.marker_null.length,
            len_und = PARSE.marker_und.length,
            len_nan = PARSE.marker_nan.length,
            len_inf = PARSE.marker_inf.length,
            len_minus_inf = PARSE.marker_minus_inf.length;

        function walker(o) {
            var i;
            if ('object' !== typeof o) return reviver(o);
            for (i in o) {
                if (o.hasOwnProperty(i)) {
                    if ('object' === typeof o[i]) walker(o[i]);
                    else o[i] = reviver(o[i]);
                }
            }
            return o;
        }

        function reviver(value) {
            var type;
            type = typeof value;

            if (type === 'string') {
                if (value.substring(0, len_prefix) !== PARSE.stringify_prefix) {
                    return value;
                }
                else if (value.substring(0, len_func) === PARSE.marker_func) {
                    return JSUS.eval(value.substring(len_prefix));
                }
                else if (value.substring(0, len_null) === PARSE.marker_null) {
                    return null;
                }
                else if (value.substring(0, len_und) === PARSE.marker_und) {
                    return undefined;
                }

                else if (value.substring(0, len_nan) === PARSE.marker_nan) {
                    return NaN;
                }
                else if (value.substring(0, len_inf) === PARSE.marker_inf) {
                    return Infinity;
                }
                else if (value.substring(0, len_minus_inf) ===
                         PARSE.marker_minus_inf) {

                    return -Infinity;
                }

            }
            return value;
        }

        return function(str) {
            return walker(JSON.parse(str));
        };

    })();

    /**
     * ## PARSE.isInt
     *
     * Checks if a value is an integer number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and floats will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed integer, or FALSE if none was found
     *
     * @see PARSE.isFloat
     * @see PARSE.isNumber
     */
    PARSE.isInt = function(n, lower, upper) {
        var regex, i;
        regex = /^-?\d+$/;
        if (!regex.test(n)) return false;
        i = parseInt(n, 10);
        if (i !== parseFloat(n)) return false;
        return PARSE.isNumber(i, lower, upper);
    };

    /**
     * ## PARSE.isFloat
     *
     * Checks if a value is a float number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and integers will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed float, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isNumber
     */
    PARSE.isFloat = function(n, lower, upper) {
        var regex;
        regex = /^-?\d*(\.\d+)?$/;
        if (!regex.test(n)) return false;
        if (n.toString().indexOf('.') === -1) return false;
        return PARSE.isNumber(n, lower, upper);
    };

    /**
     * ## PARSE.isNumber
     *
     * Checks if a value is a number (int or float) or a string containing one
     *
     * Non-numbers, Infinity, NaN will return FALSE
     *
     * @param {mixed} n The value to check
     * @param {number} lower Optional. If set, n must be greater than lower
     * @param {number} upper Optional. If set, n must be smaller than upper
     *
     * @return {boolean|number} The parsed number, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isFloat
     */
    PARSE.isNumber = function(n, lower, upper) {
        if (isNaN(n) || !isFinite(n)) return false;
        n = parseFloat(n);
        if ('number' === typeof lower && n < lower) return false;
        if ('number' === typeof upper && n > upper) return false;
        return n;
    };

    /**
     * ## PARSE.isEmail
     *
     * Returns TRUE if the email's format is valid
     *
     * @param {string} The email to check
     *
     * @return {boolean} TRUE, if the email format is valid
     */
    PARSE.isEmail = function(email) {
        var idx;
        if ('string' !== typeof email) return false;
        if (email.trim().length < 5) return false;
        idx = email.indexOf('@');
        if (idx === -1 || idx === 0 || idx === (email.length-1)) return false;
        idx = email.lastIndexOf('.');
        if (idx === -1 || idx === (email.length-1) || idx > (idx+1)) {
            return false;
        }
        return true;
    };

    /**
     * ## PARSE.range
     *
     * Decodes semantic strings into an array of integers
     *
     * Let n, m  and l be integers, then the tokens of the string are
     * interpreted in the following way:
     *
     *  - `*`: Any integer
     *  - `n`: The integer `n`
     *  - `begin`: The smallest integer in `available`
     *  - `end`: The largest integer in `available`
     *  - `<n`, `<=n`, `>n`, `>=n`: Any integer (strictly) smaller/larger than n
     *  - `n..m`, `[n,m]`: Any integer between n and m (both inclusively)
     *  - `n..l..m`: Any i
     *  - `[n,m)`: Any integer between n (inclusively) and m (exclusively)
     *  - `(n,m]`: Any integer between n (exclusively) and m (inclusively)
     *  - `(n,m)`: Any integer between n and m (both exclusively)
     *  - `%n`: Divisible by n
     *  - `%n = m`: Divisible with rest m
     *  - `!`: Logical not
     *  - `|`, `||`, `,`: Logical or
     *  - `&`, `&&`: Logical and
     *
     * The elements of the resulting array are all elements of the `available`
     * array which satisfy the expression defined by `expr`.
     *
     * Examples:
     *
     *   PARSE.range('2..5, >8 & !11', '[-2,12]'); // [2,3,4,5,9,10,12]
     *
     *   PARSE.range('begin...end/2 | 3*end/4...3...end', '[0,40) & %2 = 1');
     *        // [1,3,5,7,9,11,13,15,17,19,29,35] (end == 39)
     *
     *   PARSE.range('<=19, 22, %5', '>6 & !>27');
     *        // [7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,25]
     *
     *   PARSE.range('*','(3,8) & !%4, 22, (10,12]'); // [5,6,7,11,12,22]
     *
     *   PARSE.range('<4', {
     *       begin: 0,
     *       end: 21,
     *       prev: 0,
     *       cur: 1,
     *       next: function() {
     *           var temp = this.prev;
     *           this.prev = this.cur;
     *           this.cur += temp;
     *           return this.cur;
     *       },
     *       isFinished: function() {
     *           return this.cur + this.prev > this.end;
     *       }
     *   }); // [5, 8, 13, 21]
     *
     * @param {string|number} expr The selection expression
     * @param {mixed} available Optional. If undefined `expr` is used. If:
     *  - string: it is interpreted according to the same rules as `expr`;
     *  - array: it is used as it is;
     *  - object: provide functions next, isFinished and attributes begin, end
     *
     * @return {array} The array containing the specified values
     *
     * @see JSUS.eval
     */
    PARSE.range = function(expr, available) {
        var i,len, x;
        var solution;
        var begin, end, lowerBound, numbers;
        var invalidChars, invalidBeforeOpeningBracket, invalidDot;

        solution = [];
        if ('undefined' === typeof expr) return solution;

        // TODO: this could be improved, i.e. if it is a number, many
        // checks and regular expressions could be avoided.
        if ('number' === typeof expr) expr = '' + expr;
        else if ('string' !== typeof expr) {
            throw new TypeError('PARSE.range: expr must be string, number, ' +
                                'undefined. Found: ' + expr);
        }
        // If no available numbers defined, assumes all possible are allowed.
        if ('undefined' === typeof available) {
            available = expr;
        }
        else if (JSUS.isArray(available)) {
            if (available.length === 0) return solution;
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else if ('object' === typeof available) {
            if ('function' !== typeof available.next) {
                throw new TypeError('PARSE.range: available.next must be ' +
                                    'function. Found: ' + available.next);
            }
            if ('function' !== typeof available.isFinished) {
                throw new TypeError('PARSE.range: available.isFinished must ' +
                                    'be function. Found: ' +
                                    available.isFinished);
            }
            if ('number' !== typeof available.begin) {
                throw new TypeError('PARSE.range: available.begin must be ' +
                                    'number. Found: ' + available.begin);
            }
            if ('number' !== typeof available.end) {
                throw new TypeError('PARSE.range: available.end must be ' +
                                    'number. Found: ' + available.end);
            }

            begin = available.begin;
            end = available.end;
        }
        else if ('string' === typeof available) {
            // If the availble points are also only given implicitly,
            // compute set of available numbers by first guessing a bound.
            available = preprocessRange(available);

            numbers = available.match(/([-+]?\d+)/g);
            if (numbers === null) {
                throw new Error('PARSE.range: no numbers in available: ' +
                                available);
            }
            lowerBound = Math.min.apply(null, numbers);

            available = PARSE.range(available, {
                begin: lowerBound,
                end: Math.max.apply(null, numbers),
                value: lowerBound,
                next: function() {
                    return this.value++;
                },
                isFinished: function() {
                    return this.value > this.end;
                }
            });
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else {
            throw new TypeError('PARSE.range: available must be string, ' +
                                'array, object or undefined. Found: ' +
                                available);
        }

        // end -> maximal available value.
        expr = expr.replace(/end/g, parseInt(end, 10));

        // begin -> minimal available value.
        expr = expr.replace(/begin/g, parseInt(begin, 10));

        // Do all computations.
        expr = preprocessRange(expr);

        // Round all floats
        expr = expr.replace(/([-+]?\d+\.\d+)/g, function(match, p1) {
            return parseInt(p1, 10);
        });

        // Validate expression to only contain allowed symbols.
        invalidChars = /[^ \*\d<>=!\|&\.\[\],\(\)\-\+%]/g;
        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }

        // & -> && and | -> ||.
        expr = expr.replace(/([^& ]) *& *([^& ])/g, "$1&&$2");
        expr = expr.replace(/([^| ]) *\| *([^| ])/g, "$1||$2");

        // n -> (x == n).
        expr = expr.replace(/([-+]?\d+)/g, "(x==$1)");

        // n has already been replaced by (x==n) so match for that from now on.

        // %n -> !(x%n)
        expr = expr.replace(/% *\(x==([-+]?\d+)\)/,"!(x%$1)");

        // %n has already been replaced by !(x%n) so match for that from now on.
        // %n = m, %n == m -> (x%n == m).
        expr = expr.replace(/!\(x%([-+]?\d+)\) *={1,} *\(x==([-+]?\d+)\)/g,
            "(x%$1==$2)");

        // <n, <=n, >n, >=n -> (x < n), (x <= n), (x > n), (x >= n)
        expr = expr.replace(/([<>]=?) *\(x==([-+]?\d+)\)/g, "(x$1$2)");

        // n..l..m -> (x >= n && x <= m && !((x-n)%l)) for positive l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(\+?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x>=$1&&x<=$3&&!((x- $1)%$2))");

        // n..l..m -> (x <= n && x >= m && !((x-n)%l)) for negative l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(-\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x<=$1&&x>=$3&&!((x- $1)%$2))");

        // n..m -> (x >= n && x <= m).
        expr = expr.replace(/\(x==([-+]?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
                "(x>=$1&&x<=$2)");

        // (n,m), ... ,[n,m] -> (x > n && x < m), ... , (x >= n && x <= m).
        expr = expr.replace(
            /([(\[]) *\(x==([-+]?\d+)\) *, *\(x==([-+]?\d+)\) *([\])])/g,
                function (match, p1, p2, p3, p4) {
                    return "(x>" + (p1 == '(' ? '': '=') + p2 + "&&x<" +
                        (p4 == ')' ? '' : '=') + p3 + ')';
            }
        );

        // * -> true.
        expr = expr.replace('*', 1);

        // Remove spaces.
        expr = expr.replace(/\s/g, '');

        // a, b -> (a) || (b)
        expr = expr.replace(/\)[,] *(!*)\(/g, ")||$1(");

        // Validating the expression before eval"ing it.
        invalidChars = /[^ \d<>=!\|&,\(\)\-\+%x\.]/g;
        // Only & | ! may be before an opening bracket.
        invalidBeforeOpeningBracket = /[^ &!|\(] *\(/g;
        // Only dot in floats.
        invalidDot = /\.[^\d]|[^\d]\./;

        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }
        if (expr.match(invalidBeforeOpeningBracket)) {
            throw new Error('PARSE.range: invalid character before opending ' +
                            'bracket found: ' + expr);
        }
        if (expr.match(invalidDot)) {
            throw new Error('PARSE.range: invalid dot found: ' + expr);
        }

        if (JSUS.isArray(available)) {
            i = -1, len = available.length;
            for ( ; ++i < len ; ) {
                x = parseInt(available[i], 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        else {
            while (!available.isFinished()) {
                x = parseInt(available.next(), 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        return solution;
    };

    function preprocessRange(expr) {
        var mult = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '*' ? n1*n3 : n1/n3;
        };
        var add = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '-' ? n1 - n3 : n1 + n3;
        };
        var mod = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return n1 % n3;
        };

        while (expr.match(/([-+]?\d+) *([*\/]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([*\/]) *([-+]?\d+)/, mult);
        }

        while (expr.match(/([-+]?\d+) *([-+]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([-+]) *([-+]?\d+)/, add);
        }
        while (expr.match(/([-+]?\d+) *% *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *% *([-+]?\d+)/, mod);
        }
        return expr;
    }

    /**
     * ## PARSE.funcName
     *
     * Returns the name of the function
     *
     * Function.name is a non-standard JavaScript property,
     * although many browsers implement it. This is a cross-browser
     * implementation for it.
     *
     * In case of anonymous functions, an empty string is returned.
     *
     * @param {function} func The function to check
     *
     * @return {string} The name of the function
     *
     * Kudos to:
     * http://matt.scharley.me/2012/03/09/monkey-patch-name-ie.html
     */
    if ('undefined' !== typeof Function.prototype.name) {
        PARSE.funcName = function(func) {
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function. ' +
                                    'Found: ' + func);
            }
            return func.name;
        };
    }
    else {
        PARSE.funcName = function(func) {
            var funcNameRegex, res;
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function. ' +
                                   'Found: ' + func);
            }
            funcNameRegex = /function\s([^(]{1,})\(/;
            res = (funcNameRegex).exec(func.toString());
            return (res && res.length > 1) ? res[1].trim() : "";
        };
    }

    JSUS.extend(PARSE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # QUEUE
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles a simple queue of operations
 */
(function(JSUS) {

    "use strict";

    var QUEUE = {};

    QUEUE.getQueue = function() {
        return new Queue();
    };

    /**
     * ## Queue constructor
     */
    function Queue() {

        /**
         * ### Queue.queue
         *
         * The list of functions waiting to be executed.
         */
        this.queue = [];

        /**
         * ### Queue.inProgress
         *
         * The list of operations ids currently in progress.
         */
        this.inProgress = {};
    }

    /**
     * ### Queue.isReady
     *
     * Returns TRUE if no operation is in progress
     *
     * @return {boolean} TRUE, if no operation is in progress
     */
    Queue.prototype.isReady = function() {
        return JSUS.isEmpty(this.inProgress);
    };

    /**
     * ### Queue.onReady
     *
     * Executes the specified callback once the queue has been cleared
     *
     * Multiple functions to execute can be added, and they are executed
     * sequentially once the queue is cleared.
     *
     * If the queue is already cleared, the function is executed immediately.
     *
     * @param {function} cb The callback to execute
     */
    Queue.prototype.onReady = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Queue.onReady: cb must be function. Found: ' +
                               cb);
        }
        if (JSUS.isEmpty(this.inProgress)) cb();
        else this.queue.push(cb);
    };

    /**
     * ### Queue.add
     *
     * Adds an item to the _inProgress_ index
     *
     * @param {string} key A tentative key name
     *
     * @return {string} The unique key to be used to unregister the operation
     */
    Queue.prototype.add = function(key) {
        if (key && 'string' !== typeof key) {
            throw new Error('Queue.add: key must be string.');
        }
        key = JSUS.uniqueKey(this.inProgress, key);
        if ('string' !== typeof key) {
            throw new Error('Queue.add: an error occurred ' +
                            'generating unique key.');
        }
        this.inProgress[key] = key;
        return key;
    };

    /**
     * ### Queue.remove
     *
     * Remove a specified key from the _inProgress_ index
     *
     * @param {string} key The key to remove from the _inProgress_ index.
     */
    Queue.prototype.remove = function(key) {
        if ('string' !== typeof key) {
            throw new Error('Queue.remove: key must be string.');
        }
        delete this.inProgress[key];
        if (JSUS.isEmpty(this.inProgress)) {
            this.executeAndClear();
        }
    };

    /**
     * ### Queue.getRemoveCb
     *
     * Returns a callback to remove an item from the _inProgress_ index
     *
     * This method is useful when the callbacks is defined inside loops,
     * so that a closure is created around the variable key.
     *
     * @param {string} key The key to remove from the _inProgress_ index.
     *
     * @see Queue.remove
     */
    Queue.prototype.getRemoveCb = function(key) {
        var that;
        if ('string' !== typeof key) {
            throw new Error('Queue.getRemoveCb: key must be string.');
        }
        that = this;
        return function() { that.remove(key); };
    };

    /**
     * ### Queue.executeAndClear
     *
     * Executes sequentially all callbacks, and removes them from the queue
     */
    Queue.prototype.executeAndClear = function() {
        var i, len;
        i = -1;
        len = this.queue.length;
        for ( ; ++i < len ; ) {
            this.queue[i]();
        }
    };

    JSUS.extend(QUEUE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # RANDOM
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Generates pseudo-random numbers
 */
(function(JSUS) {

    "use strict";

    function RANDOM() {}

    /**
     * ## RANDOM.random
     *
     * Generates a pseudo-random floating point number in interval [a,b)
     *
     * Interval is a inclusive and b exclusive.
     *
     * If b is undefined, the interval is [0, a).
     *
     * If both a and b are undefined the interval is [0, 1)
     *
     * @param {number} a Optional. The lower limit, or the upper limit
     *   if b is undefined
     * @param {number} b Optional. The upper limit
     *
     * @return {number} A random floating point number in [a,b)
     */
    RANDOM.random = function(a, b) {
        var c;
        if ('undefined' === typeof b) {
            if ('undefined' === typeof a) {
                return Math.random();
            }
            else {
                b = a;
                a = 0;                
            }
        }
        if (a === b) return a;

        if (b < a) {
            c = a;
            a = b;
            b = c;
        }
        return (Math.random() * (b - a)) + a;
    };

    /**
     * ## RANDOM.randomInt
     *
     * Generates a pseudo-random integer between (a,b] a exclusive, b inclusive
     *
     * @TODO: Change to interval [a,b], and allow 1 parameter for [0,a)
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     *
     * @return {number} A random integer in (a,b]
     *
     * @see RANDOM.random
     */
    RANDOM.randomInt = function(a, b) {
        if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };

    /**
     * ## RANDOM.sample
     *
     * Generates a randomly shuffled sequence of numbers in [a,b)]
     *
     * Both _a_ and _b_ are included in the interval.
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     *
     * @return {array} The randomly shuffled sequence.
     *
     * @see RANDOM.seq
     */
    RANDOM.sample = function(a, b) {
        var out;
        out = JSUS.seq(a,b);
        if (!out) return false;
        return JSUS.shuffle(out);
    };

    /**
     * ## RANDOM.getNormalGenerator
     *
     * Returns a new generator of normally distributed pseudo random numbers
     *
     * The generator is independent from RANDOM.nextNormal
     *
     * @return {function} An independent generator
     *
     * @see RANDOM.nextNormal
     */
    RANDOM.getNormalGenerator = function() {

        return (function() {

            var oldMu, oldSigma;
            var x2, multiplier, genReady;

            return function normal(mu, sigma) {

                var x1, u1, u2, v1, v2, s;

                if ('number' !== typeof mu) {
                    throw new TypeError('nextNormal: mu must be number.');
                }
                if ('number' !== typeof sigma) {
                    throw new TypeError('nextNormal: sigma must be number.');
                }

                if (mu !== oldMu || sigma !== oldSigma) {
                    genReady = false;
                    oldMu = mu;
                    oldSigma = sigma;
                }

                if (genReady) {
                    genReady = false;
                    return (sigma * x2) + mu;
                }

                u1 = Math.random();
                u2 = Math.random();

                // Normalize between -1 and +1.
                v1 = (2 * u1) - 1;
                v2 = (2 * u2) - 1;

                s = (v1 * v1) + (v2 * v2);

                // Condition is true on average 1.27 times,
                // with variance equal to 0.587.
                if (s >= 1) {
                    return normal(mu, sigma);
                }

                multiplier = Math.sqrt(-2 * Math.log(s) / s);

                x1 = v1 * multiplier;
                x2 = v2 * multiplier;

                genReady = true;

                return (sigma * x1) + mu;

            };
        })();
    };

    /**
     * ## RANDOM.nextNormal
     *
     * Generates random numbers with Normal Gaussian distribution.
     *
     * User must specify the expected mean, and standard deviation a input
     * parameters.
     *
     * Implements the Polar Method by Knuth, "The Art Of Computer
     * Programming", p. 117.
     *
     * @param {number} mu The mean of the distribution
     * param {number} sigma The standard deviation of the distribution
     *
     * @return {number} A random number following a Normal Gaussian distribution
     *
     * @see RANDOM.getNormalGenerator
     */
    RANDOM.nextNormal = RANDOM.getNormalGenerator();

    /**
     * ## RANDOM.nextLogNormal
     *
     * Generates random numbers with LogNormal distribution.
     *
     * User must specify the expected mean, and standard deviation of the
     * underlying gaussian distribution as input parameters.
     *
     * @param {number} mu The mean of the gaussian distribution
     * @param {number} sigma The standard deviation of the gaussian distribution
     *
     * @return {number} A random number following a LogNormal distribution
     *
     * @see RANDOM.nextNormal
     */
    RANDOM.nextLogNormal = function(mu, sigma) {
        if ('number' !== typeof mu) {
            throw new TypeError('nextLogNormal: mu must be number.');
        }
        if ('number' !== typeof sigma) {
            throw new TypeError('nextLogNormal: sigma must be number.');
        }
        return Math.exp(RANDOM.nextNormal(mu, sigma));
    };

    /**
     * ## RANDOM.nextExponential
     *
     * Generates random numbers with Exponential distribution.
     *
     * User must specify the lambda the _rate parameter_ of the distribution.
     * The expected mean of the distribution is equal to `Math.pow(lamba, -1)`.
     *
     * @param {number} lambda The rate parameter
     *
     * @return {number} A random number following an Exponential distribution
     */
    RANDOM.nextExponential = function(lambda) {
        if ('number' !== typeof lambda) {
            throw new TypeError('nextExponential: lambda must be number.');
        }
        if (lambda <= 0) {
            throw new TypeError('nextExponential: ' +
                                'lambda must be greater than 0.');
        }
        return - Math.log(1 - Math.random()) / lambda;
    };

    /**
     * ## RANDOM.nextBinomial
     *
     * Generates random numbers following the Binomial distribution.
     *
     * User must specify the probability of success and the number of trials.
     *
     * @param {number} p The probability of success
     * @param {number} trials The number of trials
     *
     * @return {number} The sum of successes in n trials
     */
    RANDOM.nextBinomial = function(p, trials) {
        var counter, sum;

        if ('number' !== typeof p) {
            throw new TypeError('nextBinomial: p must be number.');
        }
        if ('number' !== typeof trials) {
            throw new TypeError('nextBinomial: trials must be number.');
        }
        if (p < 0 || p > 1) {
            throw new TypeError('nextBinomial: p must between 0 and 1.');
        }
        if (trials < 1) {
            throw new TypeError('nextBinomial: trials must be greater than 0.');
        }

        counter = 0;
        sum = 0;

        while(counter < trials){
            if (Math.random() < p) {
                sum += 1;
            }
            counter++;
        }

        return sum;
    };

    /**
     * ## RANDOM.nextGamma
     *
     * Generates random numbers following the Gamma distribution.
     *
     * This function is experimental and untested. No documentation.
     *
     * @experimental
     */
    RANDOM.nextGamma = function(alpha, k) {
        var intK, kDiv, alphaDiv;
        var u1, u2, u3;
        var x, i, tmp;

        if ('number' !== typeof alpha) {
            throw new TypeError('nextGamma: alpha must be number.');
        }
        if ('number' !== typeof k) {
            throw new TypeError('nextGamma: k must be number.');
        }
        if (alpha < 1) {
            throw new TypeError('nextGamma: alpha must be greater than 1.');
        }
        if (k < 1) {
            throw new TypeError('nextGamma: k must be greater than 1.');
        }

        u1 = Math.random();
        u2 = Math.random();
        u3 = Math.random();

        intK = Math.floor(k) + 3;
        kDiv = 1 / k;

        alphaDiv = 1 / alpha;

        x = 0;
        for (i = 3 ; ++i < intK ; ) {
            x += Math.log(Math.random());
        }

        x *= - alphaDiv;

        tmp = Math.log(u3) *
            (Math.pow(u1, kDiv) /
             ((Math.pow(u1, kDiv) + Math.pow(u2, 1 / (1 - k)))));

        tmp *=  - alphaDiv;

        return x + tmp;
    };

    /**
     * ### RANDOM.randomString
     *
     * Creates a parametric random string
     *
     * @param {number} len The length of string (must be > 0). Default, 6.
     * @param {string} chars A code specifying which sets of characters
     *   to use. Available symbols (default 'a'):
     *      - 'a': lower case letters
     *      - 'A': upper case letters
     *      - '1': digits
     *      - '!': all remaining symbols (excluding spaces)
     *      - '_': spaces (it can be followed by an integer > 0
     *             controlling the frequency of spaces, default = 1)
     * @param {boolean} useChars If TRUE, the characters of the chars
     *   parameter are used as they are instead of interpreted as
     *   special symbols. Default FALSE.
     *
     * @return {string} result The random string
     *
     * Kudos to: http://stackoverflow.com/questions/10726909/
     *           random-alpha-numeric-string-in-javascript
     */
    RANDOM.randomString = function(len, chars, useChars) {
        var mask, result, i, nSpaces;
        if ('undefined' !== typeof len) {
            if ('number' !== typeof len || len < 1) {
                throw new Error('randomString: len must a number > 0 or ' +
                                'undefined. Found: ' + len);

            }
        }
        if ('undefined' !== typeof chars) {
            if ('string' !== typeof chars || chars.trim() === '') {
                throw new Error('randomString: chars must a non-empty string ' +
                                'or undefined. Found: ' + chars);

            }
        }
        else if (useChars) {
            throw new Error('randomString: useChars is TRUE, but chars ' +
                            'is undefined.');

        }

        // Defaults.
        len = len || 6;
        chars = chars || 'a';

        // Create/use mask from chars.
        mask = '';
        if (!useChars) {
            if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
            if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (chars.indexOf('1') > -1) mask += '0123456789';
            if (chars.indexOf('!') > -1) {
                mask += '!~`@#$%^&*()_+-={}[]:";\'<>?,./|\\';
            }
            // Check how many spaces we should add.
            nSpaces = chars.indexOf('_');
            if (nSpaces > -1) {
                nSpaces = chars.charAt(nSpaces + 1);
                // nSpaces is integer > 0 or 1.
                nSpaces = JSUS.isInt(nSpaces, 0) || 1;
                if (nSpaces === 1) mask += ' ';
                else if (nSpaces === 2) mask += '  ';
                else if (nSpaces === 3) mask += '   ';
                else {
                    i = -1;
                    for ( ; ++i < nSpaces ; ) {
                        mask += ' ';
                    }
                }
            }
        }
        else {
            mask = chars;
        }

        i = -1, result = '';
        for ( ; ++i < len ; ) {
            result += mask[Math.floor(Math.random() * mask.length)];
        }
        return result;
    };

    /**
     * ### RANDOM.randomEmail
     *
     * Creates a random email address
     *
     * @TODO: add options.
     *
     * @return {string} result The random email
     */
    RANDOM.randomEmail = function() {
        return RANDOM.randomString(RANDOM.randomInt(5,15), '!Aa0') + '@' +
            RANDOM.randomString(RANDOM.randomInt(3,10))  + '.' +
            RANDOM.randomString(RANDOM.randomInt(2,3));
    };

    JSUS.extend(RANDOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);

/**
 * # TIME
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the generation,
 * manipulation, and formatting of time strings in JavaScript
 */
(function (JSUS) {

    "use strict";

    function TIME() {}

    // Polyfill for Date.toISOString (IE7, IE8, IE9)
    // Kudos: https://developer.mozilla.org/en-US/docs/Web/
    // JavaScript/Reference/Global_Objects/Date/toISOString
    if (!Date.prototype.toISOString) {
        (function() {

            function pad(number) {
                return (number < 10) ? '0' + number : number;
            }

            Date.prototype.toISOString = function() {
                var ms = (this.getUTCMilliseconds() / 1000).toFixed(3);
                return this.getUTCFullYear() +
                    '-' + pad(this.getUTCMonth() + 1) +
                    '-' + pad(this.getUTCDate()) +
                    'T' + pad(this.getUTCHours()) +
                    ':' + pad(this.getUTCMinutes()) +
                    ':' + pad(this.getUTCSeconds()) +
                    '.' + ms.slice(2, 5) + 'Z';
            };

        }());
    }

    /**
     * ## TIME.getDate
     *
     * Returns a string representation of the current date and time (ISO)
     *
     * String is formatted as follows:
     *
     * YYYY-MM-DDTHH:mm:ss.sssZ
     *
     * @return {string} Formatted time string YYYY-MM-DDTHH:mm:ss.sssZ
     */
    TIME.getDate = TIME.getFullDate = function() {
        return new Date().toISOString();
    };

    /**
     * ## TIME.getTime
     *
     * Returns a string representation of the current time
     *
     * String is ormatted as follows:
     *
     * hh:mm:ss
     *
     * @return {string} Formatted time string hh:mm:ss
     *
     * @see TIME.getTimeM
     */
    TIME.getTime = function() {
        var d;
        d = new Date();
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    };

    /**
     * ## TIME.getTimeM
     *
     * Like TIME.getTime, but with millisecondsx
     *
     * String is ormatted as follows:
     *
     * hh:mm:ss:mls
     *
     * @return {string} Formatted time string hh:mm:ss:mls
     *
     * @see TIME.getTime
     */
    TIME.getTimeM = function() {
        var d;
        d = new Date();
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +
            ':' + d.getMilliseconds();
    };

    /**
     * ## TIME.parseMilliseconds
     *
     * Parses milliseconds into an array of days, hours, minutes and seconds
     *
     * @param {number} ms Integer representing milliseconds
     *
     * @return {array} Milleconds parsed in days, hours, minutes, and seconds
     */
    TIME.parseMilliseconds = function(ms) {
        var result, x, seconds, minutes, hours, days;
        if ('number' !== typeof ms) {
            throw new TypeError('TIME.parseMilliseconds: ms must be number.');
        }
        result = [];
        x = ms / 1000;
        result[4] = x;
        seconds = x % 60;
        result[3] = Math.floor(seconds);
        x = x / 60;
        minutes = x % 60;
        result[2] = Math.floor(minutes);
        x = x / 60;
        hours = x % 24;
        result[1] = Math.floor(hours);
        x = x / 24;
        days = x;
        result[1] = Math.floor(days);
        return result;
    };


    /**
     * ## TIME.now
     *
     * Shortcut to Date.now (when existing), or its polyfill
     *
     * @return {number} The timestamp now
     */
    TIME.now = 'function' === typeof Date.now ?
        Date.now : function() { return new Date().getTime(); }

    JSUS.extend(TIME);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
