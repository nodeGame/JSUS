(function (JSUS) {
	
	function EVAL(){};

	/**
	 * Allows to execute the eval function within a given 
	 * context. If no context is passed a reference to the
	 * this object is used.
	 * 
	 */
	EVAL.eval = function (str, context) {
		var context = context || this;
    	// Eval must be called indirectly
    	// i.e. eval.call is not possible
    	//console.log(str);
    	var func = function (str) {
    		// TODO: Filter str
    		return eval(str);
    	}
    	return func.call(context, str);
    };
    
    JSUS.extend(EVAL);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);