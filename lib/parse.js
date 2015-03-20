/**
 * # PARSE
 *
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to parsing strings
 */
(function(JSUS) {

    function PARSE() {}

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

    PARSE.marker_func = PARSE.stringify_prefix + 'function';
    PARSE.marker_null = PARSE.stringify_prefix + 'null';
    PARSE.marker_und = PARSE.stringify_prefix + 'undefined';
    PARSE.marker_nan = PARSE.stringify_prefix + 'NaN';
    PARSE.marker_inf = PARSE.stringify_prefix + 'Infinity';
    PARSE.marker_minus_inf = PARSE.stringify_prefix + '-Infinity';

    /**
     * ## PARSE.getQueryString
     *
     * Parses current querystring and returns the requested variable.
     *
     * If no variable name is specified, returns the full query string.
     * If requested variable is not found returns false.
     *
     * @param {string} name Optional. If set, returns only the value
     *   associated with this variable
     * @param {string} referer Optional. If set, searches this string
     *
     * @return {string|boolean} The querystring, or a part of it, or FALSE
     *
     * Kudos:
     * @see http://stackoverflow.com/q/901115/3347292
     */
    PARSE.getQueryString = function(name, referer) {
        var regex;
        if (referer && 'string' !== typeof referer) {
            throw new TypeError('JSUS.getQueryString: referer must be string ' +
                                'or undefined.');
        }
        referer = referer || window.location.search;
        if ('undefined' === typeof name) return referer;
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        results = regex.exec(referer);
        return results === null ? false :
            decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    /**
     * ## PARSE.tokenize
     *
     * Splits a string in tokens that users can specified as input parameter.
     * Additional options can be specified with the modifiers parameter
     *
     * - limit: An integer that specifies the number of split items
     *     after the split limit will not be included in the array
     *
     * @param {string} str The string to split
     * @param {array} separators Array containing the separators words
     * @param {object} modifiers Optional. Configuration options
     *   for the tokenizing
     *
     * @return {array} Tokens in which the string was split
     */
    PARSE.tokenize = function(str, separators, modifiers) {
        var pattern, regex;
        if (!str) return;
        if (!separators || !separators.length) return [str];
        modifiers = modifiers || {};

        pattern = '[';

        JSUS.each(separators, function(s) {
            if (s === ' ') s = '\\s';

            pattern += s;
        });

        pattern += ']+';

        regex = new RegExp(pattern);
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
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see JSON.stringify
     * @see PARSE.stringify_prefix
     */
    PARSE.stringify = function(o, spaces) {
        return JSON.stringify(o, function(key, value) {
            var type = typeof value;
            if ('function' === type) {
                return PARSE.stringify_prefix + value.toString();
            }

            if ('undefined' === type) return PARSE.marker_und;
            if (value === null) return PARSE.marker_null;
            if ('number' === type && isNaN(value)) return PARSE.marker_nan;
            if (value === Number.POSITIVE_INFINITY) return PARSE.marker_inf;
            if (value === Number.NEGATIVE_INFINITY) {
                return PARSE.marker_minus_inf;
            }

            return value;

        }, spaces);
    };

    /**
     * ## PARSE.stringifyAll
     *
     * Copies all the properties of the prototype before stringifying
     *
     * Notice: The original object is modified!
     *
     * @param {mixed} o The value to stringify
     * @param {number} spaces Optional the number of indentation spaces.
     *   Defaults, 0
     *
     * @return {string} The stringified result
     *
     * @see PARSE.stringify
     */
    PARSE.stringifyAll = function(o, spaces) {
        for (var i in o) {
            if (!o.hasOwnProperty(i)) {
                if ('object' === typeof o[i]) {
                    o[i] = PARSE.stringifyAll(o[i]);
                }
                else {
                    o[i] = o[i];
                }
            }
        }
        return PARSE.stringify(o);
    };

    /**
     * ## PARSE.parse
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

        var len_prefix = PARSE.stringify_prefix.length,
            len_func = PARSE.marker_func.length,
            len_null = PARSE.marker_null.length,
            len_und = PARSE.marker_und.length,
            len_nan = PARSE.marker_nan.length,
            len_inf = PARSE.marker_inf.length,
            len_minus_inf = PARSE.marker_minus_inf.length;


        var o = JSON.parse(str);
        return walker(o);

        function walker(o) {
            if ('object' !== typeof o) return reviver(o);

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
                else if (value.substring(0, len_func) === PARSE.marker_func) {
                    return JSUS.eval(value.substring(len_prefix));
                }
                else if (value.substring(0, len_null) === PARSE.marker_null) {
                    return null;
                }
                else if (value.substring(0, len_und) === PARSE.marker_und) {
                    return undefined;
                }

                else if (value.substring(0, len_nan) === PARSE.marker_nan) {
                    return NaN;
                }
                else if (value.substring(0, len_inf) === PARSE.marker_inf) {
                    return Infinity;
                }
                else if (value.substring(0, len_minus_inf) ===
                         PARSE.marker_minus_inf) {

                    return -Infinity;
                }

            }
            return value;
        }
    };
    // available can be an array, a string or a object.
    PARSE.range = function(expr, available) {
        var i;
        var solution = [];
        var numberRegExp;
        var begin, end, lowerBound, upperBound;

        if ("undefined" === typeof expr) {
            return [];
        }

        if ("undefined" === typeof available) {
            throw new Error();
        }
        if (!J.isArray(available)) {
            if ("string" !== typeof available) {
                if ("function" !== typeof available.next ||
                    "function" !== typeof available.isFinished ||
                    "number"   !== typeof available.begin ||
                    "number"   !== typeof available.end
                )
                throw new Error();
            }
        }


        // & -> && and | -> ||.
        expr = expr.replace(/([^&])&([^&])/g, "$1&&$2");
        expr = expr.replace(/([^|])\|([^|])/g, "$1||$2");

        if (J.isArray(available)) {
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        // If the availble points are also only given implicitly, compute set
        // of available numbers by first guessing a bound.
        else if ("string" === typeof available) {
            numbers = available.match(/([-+]?\d+)/g);
            lowerBound = Math.min.apply(null, numbers);
            upperBound = Math.max.apply(null, numbers);

            available = range(available, {
                begin: lowerBound,
                end: upperBound,
                value: lowerBound,
                next: function() {
                    return this.value++;
                },
                isFinished: function() {
                    return this.value > this.end;
                }
            });
        }
        else {
            begin = available.begin;
            end = available.end;
        }

        // end -> maximal available value.
        expr = expr.replace("end", end);

        // begin -> minimal available value.
        expr = expr.replace("begin", begin);

        // n -> (x == n).
        expr = expr.replace(/([-+]?\d+)/g, "(x == $1)");

        // n has already been replaced by (x == n) so match for that.
        // <n, <=n, >n, >=n -> (x < n), (x <= n), (x > n), (x >= n)
        expr = expr.replace(/([<>]=?) *\(x == ([-+]?\d+)\)/g, "(x $1 $2)");

        // n..m -> (x >= n && x <= m).
        // n has already been replaced by (x == n) so match for that.
        expr = expr.replace(/\(x == ([-+]?\d+)\)\.+\(x == ([-+]?\d+)\)/g,
                "(x >= $1 && x <= $2)");

        // (n,m), ... ,[n,m] -> (x > n && x < m), ... , (x >= n && x <= m).
        expr = expr.replace(
            /([(\[]) *\(x == ([-+]?\d+)\) *, *\(x == ([-+]?\d+)\) *([\])])/g,
                function (match, p1, p2, p3, p4) {
                    return "(x >" + (p1 == '(' ? ' ' : "= ") + p2 + " && x <" +
                        (p4 == ')' ? ' ' : "= ") + p3 + ')';
            }
        );

        // a, b -> (a) || (b)
        expr = '(' + expr.replace(/,/g, ") || (") + ')';


        // * -> true.
        expr = expr.replace('*', 1);

        // Validating the expression before eval"ing it.
        invalidChars = /[^ \(\)&|<>\+=\*\/\-\dx]/g;
        // Only & | ! may be before an opening bracket.
        invalidBeforeOpeningBracket = /[^ &!|\=\-\*\/\(] *\(/g;
        // Only the no word may be spelled.
        invalidWord = /x[^ <>=\)]/g;

        if (expr.match(invalidChars)) {
            throw new Error();
        }
        if (expr.match(invalidBeforeOpeningBracket)) {
            throw new Error();
        }
        if (expr.match(invalidWord)) {
            throw new Error();
        }

        if (J.isArray(available)) {
            for (i in available) {
                if (available.hasOwnProperty(i)) {
                    x = parseInt(available[i]);
                    if (eval(expr)) {
                        solution.push(x);
                    }
                }
            }
        }
        else {
            while (!available.isFinished()) {
                x = parseInt(available.next());
                if (eval(expr)) {
                    solution.push(x);
                }
            }
        }
        return solution;
    };


    JSUS.extend(PARSE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
