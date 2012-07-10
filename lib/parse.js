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
     * Splits a string in tokens that users can specified as input parameter
     * 
     * @param {string} str The string to split
     * @param {Array} separators Array containing the separators words
     * @return {Array} Tokens in which the string was split
     * 
     */
    PARSE.tokenize = function (str, separators) {
    	if (!str) return;
    	if (!tokens) return [str];
    	
    	// @see http://stackoverflow.com/questions/650022/how-do-i-split-a-string-with-multiple-separators-in-javascript
    	
    	return str.split(/.*<\s*%/);
    };
    
    JSUS.extend(PARSE);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);