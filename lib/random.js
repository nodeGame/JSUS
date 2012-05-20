(function (JSUS) {
    
    function RANDOM(){};

    /**
     * Generates a pseudo-random floating point number between 
     * (a,b), both a and b exclusive.
     * 
     */
    RANDOM.random = function (a, b) {
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
     * Generates a pseudo-random integer between 
     * (a,b] a exclusive, b inclusive.
     * 
     */
    RANDOM.randomInt = function (a, b) {
    	if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };
    
    
    JSUS.extend(RANDOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);