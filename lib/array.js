(function (JSUS) {
    
    function ARRAY(){};
    
    
    /**
     * Add the filter method to ARRAY objects in case the method is not
     * supported natively. 
     * See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/ARRAY/filter#Compatibility
     * 
     * @TODO: make a static method instead
     * 
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
     * Removes an element from the the array, and returns it.
     * For objects, deep equality comparison is performed 
     * through JSUS.equals.
     * 
     * If no element is removed returns FALSE.
     * 
     */
    ARRAY.removeElement = function (needle, haystack) {
                
        if ('object' === typeof needle) {
            var func = JSUS.equals;
        } else {
            var func = function (a,b) {
                return (a === b);
            }
        }
        
        for (var i=0; i < haystack.length; i++) {
            if (func(needle, haystack[i])){
                return haystack.splice(i,1);
            }
        }
        
        return false;
    };
    
    /**
     * Returns TRUE if the element is contained in the array,
     * FALSE otherwise.
     * 
     * For objects, deep equality comparison is performed 
     * through JSUS.equals.
     * 
     */
    ARRAY.in_array = function (needle, haystack) {
        if ('undefined' === typeof needle || !haystack) return false;
            
        if ('object' === typeof needle) {
            var func = JSUS.equals;
        } else {
            var func = function (a,b) {
                return (a === b);
            }
        }
        
        for (var i = 0; i < haystack.length; i++) {
            if (func.call(this, needle, haystack[i])) return true;
        }
        return false;
    };
    
    /**
     * Returns an array of N array containing the same number of elements
     * The last group could have less elements.
     *  
     *  @TODO: explain the differences of all the methods below 
     *  @see ARRAY.getGroupsSizeN
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     */ 
    ARRAY.getNGroups = function (array, N) {
        return ARRAY.getGroupsSizeN(array, Math.floor(array.length / N));
    };
    
    /**
     * Returns an array of array containing N elements each
     * The last group could have less elements.
     * 
     *  @see ARRAY.getNGroups
     *  @see ARRAY.generateCombinations
     *  @see ARRAY.matchN
     * 
     */ 
    ARRAY.getGroupsSizeN = function (array, N) {
        
        var copy = array.slice(0);
        var len = copy.length;
        var originalLen = copy.length;
        var result = [];
        
        // Init values for the loop algorithm
        var i;
        var idx;
        var group = [];
        var count = 0;
        for (i=0; i < originalLen; i++) {
            
            // Get a random idx between 0 and array length
            idx = Math.floor(Math.random()*len);
            
            // Prepare the array container for the elements of a new group
            if (count >= N) {
                result.push(group);
                count = 0;
                group = [];
            }
            
            // Insert element in the group
            group.push(copy[idx]);
            
            // Update
            copy.splice(idx,1);
            len = copy.length;
            count++;
        }
        
        // Add any remaining element
        if (group.length > 0) {
            result.push(group);
        }
        
        return result;
    };
    
    /**
     * Generate a random Latin Square of size S.
     * 
     * If N is defined, it returns a "Latin Rectangle" (SxN)
     * 
     */
    ARRAY.prototype.latinSquare = function (S, N) {
    	if (!N) N = S;
    	if (!S || S < 0 || (N < 0)) return false;
    	
    	var seq = [];
    	var latin = [];
    	for (var i=0; i< S; i++) {
    		seq[i] = i;
    	}
    	
    	var idx = null;
    	var extracted = [];
    	for (i=0; i<N; i++) {
    		extracted.push(i);
    		do {
    			idx = JSUS.randomInt(0,S);
    		}
    		while (JSUS.in_array(idx, extracted));
    		extracted.pop();
    		extracted.push(idx);
    		latin[i] = seq.slice(idx).concat(seq.slice(0,(idx)));
    	}
    	
    	return latin;
    };
    
    
    /**
     *  Generates all distinct combinations of exactly 
     *  r elements each and returns them into an array.
     *  
     *  @see ARRAY.getGroupSizeN
     *  @see ARRAY.getNGroups
     *  @see ARRAY.matchN
     * 
     */
    ARRAY.generateCombinations = function (array, r) {
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
     * Match each element of the array with N random others.
     * If strict is equal to true, elements cannot be matched multiple times.
     * 
     * TODO: This has a bug / feature. The last element could remain alone, 
     * because all the other have been already coupled. Another recombination
     * would be able to match all the elements instead.
     * 
     *  @see ARRAY.getGroupSizeN
     *  @see ARRAY.getNGroups
     *  @see ARRAY.generateCombinations
     * 
     */
    ARRAY.matchN = function (array, N, strict) {

        var result = []
        var len = array.length;
        var found = [];
        for (var i = 0 ; i < len ; i++) {
            // Recreate the array
            var copy = array.slice(0);
            copy.splice(i,1);
            if (strict) {
                copy = ARRAY.arrayDiff(copy,found);
            }
            var group = ARRAY.getNRandom(copy,N);
            // Add to the set of used elements
            found = found.concat(group);
            // Re-add the current element
            group.splice(0,0,array[i]);
            result.push(group);
            
            //Update
            group = [];
            
        }
        return result;
    };
    
    /**
     * Appends an array to itself and return a new array.
     * 
     * The original array is not modified.
     * 
     */
    ARRAY.arraySelfConcat = function (array) {
        var i = 0;
        var len = array.length;
        var result = []
        for (; i < len; i++) {
            result = result.concat(array[i]);
        }
        return result;
    };
    

    /**
     * Computes the intersection between two arrays. 
     * 
     * Arrays can contain both primitive types and objects.
     * 
     */
    ARRAY.arrayIntersect = function (a1, a2) {
        return a1.filter( function(i) {
            return JSUS.in_array(i, a2);
        });
    };
        
    /**
     * Performs a diff between two arrays.
     * 
     * Arrays can contain both primitive types and objects.
     * Returns all the values of the first array which are not present 
     * in the second one.
     * 
     */
    ARRAY.arrayDiff = function (a1, a2) {
        return a1.filter( function(i) {
            return !(JSUS.in_array(i, a2));
        });
    };
    
    /**
     * Shuffles the elements of the array using the Fischer algorithm.
     * 
     * See http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     * 
     */
    ARRAY.shuffle = function (array) {
        var copy = array.slice(0);
        var len = array.length-1; // ! -1
        for (var i = len; i > 0; i--) {
            var j = Math.floor(Math.random()*(i+1));
            var tmp = copy[j];
            copy[j] = copy[i];
            copy[i] = tmp;
            //console.log(copy);
        }
        return copy;
    };
    
    /**
     * Select N random elements from the array and returns them.
     * 
     */
    ARRAY.getNRandom = function (array, N) {
        return ARRAY.shuffle(array).slice(0,N);
    };                           
        
    JSUS.extend(ARRAY);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);