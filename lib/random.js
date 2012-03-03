(function (JSUS) {
    
    function RANDOM(){};

    /**
     * Generates a pseudo-random floating point number between 
     * a and b.
     * 
     */
    RANDOM.random = function (a, b) {
        var a = a || 0;
        var b = b || 1;
        return a + Math.random() * b;
    };
    
    /**
     * Generates a pseudo-random integer between 
     * a and b.
     */
    RANDOM.randomInt = function (a, b) {
        return Math.floor(RANDOM.random(a, b) + 1);
    };
    
    
    JSUS.extend(RANDOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);