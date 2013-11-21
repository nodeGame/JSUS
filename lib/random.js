/**
 * # RANDOM
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 * 
 * Collection of static functions related to the generation of 
 * pseudo-random numbers.
 * ---
 */
(function(JSUS) {
    
    function RANDOM(){};

    /**
     * ## RANDOM.random
     * 
     * Generates a pseudo-random floating point number between 
     * (a,b), both a and b exclusive.
     * 
     * @param {number} a The lower limit 
     * @param {number} b The upper limit
     * @return {number} A random floating point number in (a,b)
     */
    RANDOM.random = function(a, b) {
        a = ('undefined' === typeof a) ? 0 : a;
        b = ('undefined' === typeof b) ? 0 : b;
        if (a === b) return a;
        
        if (b < a) {
            var c = a;
            a = b;
            b = c;
        }
        return (Math.random() * (b - a)) + a
    };

    /**
     * ## RANDOM.randomInt
     * 
     * Generates a pseudo-random integer between 
     * (a,b] a exclusive, b inclusive.
     * 
     * @param {number} a The lower limit 
     * @param {number} b The upper limit
     * @return {number} A random integer in (a,b]
     * 
     * @see RANDOM.random
     */
    RANDOM.randomInt = function(a, b) {
        if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };

    RANDOM.sample = function(a, b) {
        var out;
        out = JSUS.seq(a,b)
        if (!out) return false;
        return JSUS.shuffle(out);
    }

    JSUS.extend(RANDOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);