/**
 * # ARRAY
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 * 
 * Collection of static functions to manipulate arrays.
 */
(function(JSUS) {
    
    function ARRAY(){};

    /**
     * ## ARRAY.filter
     * 
     * Add the filter method to ARRAY objects in case the method is not
     * supported natively. 
     * 
     * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/ARRAY/filter
     */
    if (!Array.prototype.filter) {  
        Array.prototype.filter = function(fun /*, thisp */) {  
            "use strict";  
            if (this === void 0 || this === null) throw new TypeError();  

            var t = Object(this);  
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
     * @see Array.isArray
     */
    ARRAY.isArray = function(o) {
        if (!o) return false;
        return Object.prototype.toString.call(o) === '[object Array]';  
    };

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
     * @return {array} out The final sequence 
     */
    ARRAY.seq = function(start, end, increment, func) {
        var i;
        if ('number' !== typeof start) return false;
        if (start === Infinity) return false;
        if ('number' !== typeof end) return false;
        if (end === Infinity) return false;
        if (start === end) return [start];
        
        if (increment === 0) return false;
        if (!JSUS.in_array(typeof increment, ['undefined', 'number'])) {
            return false;
        }
        
        increment = increment || 1;
        func = func || function(e) {return e;};
        
        i = start,
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
     * @param {Function} func The callback for each element in the array
     * @param {object} context Optional. The context of execution of the
     *   callback. Defaults ARRAY.each
     * 
     * @return {Boolean} TRUE, if execution was successful
     */
    ARRAY.each = function(array, func, context) {
        if ('object' !== typeof array) return false;
        if (!func) return false;
        
        context = context || this;
        var i, len = array.length;
        for (i = 0 ; i < len; i++) {
            func.call(context, array[i]);
        }
        return true;
    };

    /**
     * ## ARRAY.map
     * 
     * Applies a callback function to each element in the db, store
     * the results in an array and returns it
     * 
     * Any number of additional parameters can be passed after the 
     * callback function
     * 
     * @return {array} out The result of the mapping execution
     * @see ARRAY.each
     */
    ARRAY.map = function() {
        if (arguments.length < 2) return;
        var args = Array.prototype.slice.call(arguments),
        array = args.shift(),
        func = args[0];
        
        if (!ARRAY.isArray(array)) {
            JSUS.log('ARRAY.map() the first argument must be an array. ' +
                     'Found: ' + array);
            return;
        }

        var out = [],
        o = undefined;
        for (var i = 0; i < array.length; i++) {
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
     * @see JSUS.equals
     */
    ARRAY.removeElement = function(needle, haystack) {
        var func, i;
        if ('undefined' === typeof needle || !haystack) return false;
        
        if ('object' === typeof needle) {
            func = JSUS.equals;
        }
        else {
            func = function(a,b) {
                return (a === b);
            }
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
     * Alias ARRAY.in_array (deprecated)
     * 
     * @param {mixed} needle The element to search in the array
     * @param {array} haystack The array to search in
     * @return {Boolean} TRUE, if the element is contained in the array
     * 
     *  @see JSUS.equals
     */
    ARRAY.inArray = ARRAY.in_array = function(needle, haystack) {
        var func, i, len;
        if (!haystack) return false;        
        func = JSUS.equals, len = haystack.length;
        for (i = 0; i < len; i++) {
            if (func.call(this, needle, haystack[i])) {
                return true;
            }
        }
        // <!-- console.log(needle, haystack); -->
        return false;
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
     * @return {array} Array containing N groups
     */ 
    ARRAY.getNGroups = function(array, N) {
        return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
    };

    /**
     * ## ARRAY.getGroupsSizeN
     * 
     * Returns an array of array containing N elements each
     * The last group could have less elements
     * 
     * @param {array} array The array to split in subgroups
     * @param {number} N The number of elements in each subgroup
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
            while (JSUS.in_array(idx, extracted));
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
     * @return {array} The resulting latin square (or rectangle)
     */
    ARRAY.latinSquareNoSelf = function(S, N) {
        if (!N) N = S-1;
        if (!S || S < 0 || (N < 0)) return false;
        if (N > S) N = S-1;
        
        return ARRAY._latinSquare(S, N, false);
    }


    /**
     * ## ARRAY.generateCombinations
     * 
     * Generates all distinct combinations of exactly r elements each 
     *  
     * @param {array} array The array from which the combinations are extracted
     * @param {number} r The number of elements in each combination
     * @return {array} The total sets of combinations
     *  
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.matchN
     */
    ARRAY.generateCombinations = function(array, r) {
        function values(i, a) {
            var ret = [];
            for (var j = 0; j < i.length; j++) ret.push(a[i[j]]);
            return ret;
        }
        var n = array.length;
        var indices = [];
        for (var i = 0; i < r; i++) indices.push(i);
        var final = [];
        for (var i = n - r; i < n; i++) final.push(i);
        while (!JSUS.equals(indices, final)) {
            callback(values(indices, array));
            var i = r - 1;
            while (indices[i] == n - r + i) i -= 1;
            indices[i] += 1;
            for (var j = i + 1; j < r; j++) indices[j] = indices[i] + j - i;
        }
        return values(indices, array); 
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
     * @param {Boolean} strict Optional. If TRUE, matched elements cannot be
     *   repeated. Defaults, FALSE 
     * @return {array} result The results of the matching
     * 
     * @see ARRAY.getGroupSizeN
     * @see ARRAY.getNGroups
     * @see ARRAY.generateCombinations
     */
    ARRAY.matchN = function(array, N, strict) {
        var result, i, copy, group;
        if (!array) return;
        if (!N) return array;
        
        result = [],
        len = array.length,
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
        
        i = 1, result = array.slice(0);
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
            return JSUS.in_array(i, a2);
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
            return !(JSUS.in_array(i, a2));
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
     * @return {array} out A copy of the array without duplicates
     * 
     * @see JSUS.equals
     */
    ARRAY.distinct = function(array) {
        var out = [];
        if (!array) return out;
        
        ARRAY.each(array, function(e) {
            if (!ARRAY.in_array(e, out)) {
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