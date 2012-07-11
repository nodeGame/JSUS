(function (JSUS) {
    
    function PARSE(){};

    /**
     * ## PARSE.getQueryString
     * 
     * Returns the full querystring or a specific variable.
     * Return false if the requested variable is not found.
     * 
     */
    PARSE.getQueryString = function (variable) {
        var query = window.location.search.substring(1);
        if ('undefined' === typeof variable) return query;
        
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) {
                return unescape(pair[1]);
            }
        }
        return false;
    };
    
    /**
     * ## PARSE.tokenize
     * 
     * Splits a string in tokens that users can specified as input parameter.
     * Additional options can be specified with the modifiers parameter:
     * 
     * 	- limit: An integer that specifies the number of splits, 
     * 		items after the split limit will not be included in the array
     * 
     * @param {string} str The string to split
     * @param {Array} separators Array containing the separators words
     * @param {object} modifiers Optional. Configuration options for the tokenizing
     * 
     * @return {Array} Tokens in which the string was split
     * 
     */
    PARSE.tokenize = function (str, separators, modifiers) {
    	if (!str) return;
    	if (!separators || !separators.length) return [str];
    	modifiers = modifiers || {};
    	
    	var pattern = '[';
    	
    	JSUS.each(separators, function(s) {
    		if (s === ' ') s = '\\s';
    		
    		pattern += s;
    	});
    	
    	pattern += ']+';
    	
    	var regex = new RegExp(pattern);
    	return str.split(regex, modifiers.limit);
    };
    
    JSUS.extend(PARSE);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);