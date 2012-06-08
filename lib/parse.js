(function (JSUS) {
    
    function PARSE(){};

    /**
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
    
    JSUS.extend(PARSE);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);