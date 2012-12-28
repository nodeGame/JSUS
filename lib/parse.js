/**
 * # PARSE
 *  
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Collection of static functions related to parsing strings
 * 
 */
(function (JSUS) {
    
function PARSE(){};

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

/**
 * ## PARSE.getQueryString
 * 
 * Parses the current querystring and returns it full or a specific variable.
 * Return false if the requested variable is not found.
 * 
 * @param {string} variable Optional. If set, returns only the value associated
 *   with this variable
 *   
 * @return {string|boolean} The querystring, or a part of it, or FALSE
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
 * Additional options can be specified with the modifiers parameter
 * 
 * - limit: An integer that specifies the number of splits, 
 * 		items after the split limit will not be included in the array
 * 
 * @param {string} str The string to split
 * @param {array} separators Array containing the separators words
 * @param {object} modifiers Optional. Configuration options for the tokenizing
 * 
 * @return {array} Tokens in which the string was split
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
 * @param {number} spaces Optional the number of indentation spaces. Defaults, 0
 * 
 * @return {string} The stringified result
 * 
 * @see JSON.stringify
 * @see PARSE.stringify_prefix
 */
PARSE.stringify = function(o, spaces) {
	return JSON.stringify(o, function(key, value){
		var type = typeof value;
		
		if ('function' === type) {
			return PARSE.stringify_prefix + value.toString()
		}
		
		if ('undefined' === type) {
			return PARSE.stringify_prefix + 'undefined';
		}
		
		if (value === null) {
			return PARSE.stringify_prefix + 'null';
		}
		
		return value;
		
	}, spaces);
};

/**
 * ## PARSE.stringify
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
PARSE.parse = function(str) {
	
	var marker_func = PARSE.stringify_prefix + 'function',
		marker_null = PARSE.stringify_prefix + 'null',
		marker_und	= PARSE.stringify_prefix + 'undefined';
	
	var len_prefix 	= PARSE.stringify_prefix.length,
		len_func 	= marker_func.length,
		len_null 	= marker_null.length,
		len_und 	= marker_und.length;	
	
	var o = JSON.parse(str);
	return walker(o);
	
	function walker(o) {
		var tmp;
		
		if ('object' !== typeof o) {
			return reviver(o);
		}
		
		for (var i in o) {
			if (o.hasOwnProperty(i)) {
				if ('object' === typeof o[i]) {
					walker(o[i]);
				}
				else {
					o[i] = reviver(o[i]);
				}
			}
		}
		
		return o;
	}
	
	function reviver(value) {
		var type = typeof value;
		
		if (type === 'string') {
			if (value.substring(0, len_prefix) !== PARSE.stringify_prefix) {
				return value;
			}
			else if (value.substring(0, len_func) === marker_func) {
				return eval('('+value.substring(len_prefix)+')');
			}
			else if (value.substring(0, len_null) === marker_null) {
				return null;
			}
			else if (value.substring(0, len_und) === marker_und) {
				return undefined;
			}
		}	
	};
}


JSUS.extend(PARSE);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);