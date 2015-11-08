/**
 * # PARSE
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to parsing strings
 */
(function(JSUS) {

    "use strict";

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
        var regex, results;
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

    /**
     * ## PARSE.isInt
     *
     * Checks if a value is an integer number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and floats will return FALSE
     *
     * @param {mixed} n The value to check
     *
     * @return {boolean|number} The parsed integer, or FALSE if none was found
     *
     * @see PARSE.isFloat
     * @see PARSE.isNumber
     */
    PARSE.isInt = function(n, lower, upper) {
        var regex, i;
        regex = /^-?\d+$/;
        if (!regex.test(n)) return false;
        i = parseInt(n, 10);
        if (i !== parseFloat(n)) return false;
        return PARSE.isNumber(i, lower, upper);
    };

    /**
     * ## PARSE.isFloat
     *
     * Checks if a value is a float number or a string containing one
     *
     * Non-numbers, Infinity, NaN, and integers will return FALSE
     *
     * @param {mixed} n The value to check
     *
     * @return {boolean|number} The parsed float, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isNumber
     */
    PARSE.isFloat = function(n, lower, upper) {
        var regex;
        regex = /^-?\d*(\.\d+)?$/;
        if (!regex.test(n)) return false;
        if (n.toString().indexOf('.') === -1) return false;
        return PARSE.isNumber(n, lower, upper);
    };

    /**
     * ## PARSE.isNumber
     *
     * Checks if a value is a number (int or float) or a string containing one
     *
     * Non-numbers, Infinity, NaN will return FALSE
     *
     * @param {mixed} n The value to check
     *
     * @return {boolean|number} The parsed number, or FALSE if none was found
     *
     * @see PARSE.isInt
     * @see PARSE.isFloat
     */
    PARSE.isNumber = function(n, lower, upper) {
        if (isNaN(n) || !isFinite(n)) return false;
        n = parseFloat(n);
        if ('number' === typeof lower && n < lower) return false;
        if ('number' === typeof upper && n > upper) return false;
        return n;
    };

    /**
     * ## PARSE.range
     *
     * Decodes semantic strings into an array of integers
     *
     * Let n, m  and l be integers, then the tokens of the string are
     * interpreted in the following way:
     *
     *  - `*`: Any integer
     *  - `n`: The integer `n`
     *  - `begin`: The smallest integer in `available`
     *  - `end`: The largest integer in `available`
     *  - `<n`, `<=n`, `>n`, `>=n`: Any integer (strictly) smaller/larger than n
     *  - `n..m`, `[n,m]`: Any integer between n and m (both inclusively)
     *  - `n..l..m`: Any i
     *  - `[n,m)`: Any integer between n (inclusively) and m (exclusively)
     *  - `(n,m]`: Any integer between n (exclusively) and m (inclusively)
     *  - `(n,m)`: Any integer between n and m (both exclusively)
     *  - `%n`: Divisible by n
     *  - `%n = m`: Divisible with rest m
     *  - `!`: Logical not
     *  - `|`, `||`, `,`: Logical or
     *  - `&`, `&&`: Logical and
     *
     * The elements of the resulting array are all elements of the `available`
     * array which satisfy the expression defined by `expr`.
     *
     * Examples:
     *
     *   PARSE.range('2..5, >8 & !11', '[-2,12]'); // [2,3,4,5,9,10,12]
     *
     *   PARSE.range('begin...end/2 | 3*end/4...3...end', '[0,40) & %2 = 1');
     *        // [1,3,5,7,9,11,13,15,17,19,29,35] (end == 39)
     *
     *   PARSE.range('<=19, 22, %5', '>6 & !>27');
     *        // [7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,25]
     *
     *   PARSE.range('*','(3,8) & !%4, 22, (10,12]'); // [5,6,7,11,12,22]
     *
     *   PARSE.range('<4', {
     *       begin: 0,
     *       end: 21,
     *       prev: 0,
     *       cur: 1,
     *       next: function() {
     *           var temp = this.prev;
     *           this.prev = this.cur;
     *           this.cur += temp;
     *           return this.cur;
     *       },
     *       isFinished: function() {
     *           return this.cur + this.prev > this.end;
     *       }
     *   }); // [5, 8, 13, 21]
     *
     * @param {string} expr The string specifying the selection expression
     * @param {mixed} available Optional. If undefined `expr` is used. If:
     *  - string: it is interpreted according to the same rules as `expr`;
     *  - array: it is used as it is;
     *  - object: provide functions next, isFinished and attributes begin, end
     *
     * @return {array} The array containing the specified values
     *
     * @see JSUS.eval
     */
    PARSE.range = function(expr, available) {
        var i,len, x;
        var solution;
        var begin, end, lowerBound, numbers;
        var invalidChars, invalidBeforeOpeningBracket, invalidDot;

        solution = [];
        if ('undefined' === typeof expr) return solution;

        // If no available numbers defined, assumes all possible are allowed.
        if ('undefined' === typeof available) {
            available = expr;
        }
        else if (JSUS.isArray(available)) {
            if (available.length === 0) return solution;
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else if ('object' === typeof available) {
            if ('function' !== typeof available.next) {
                throw new TypeError('PARSE.range: available.next must be ' +
                                    'function.');
            }
            if ('function' !== typeof available.isFinished) {
                throw new TypeError('PARSE.range: available.isFinished must ' +
                                    'be function.');
            }
            if ('number' !== typeof available.begin) {
                throw new TypeError('PARSE.range: available.begin must be ' +
                                    'number.');
            }
            if ('number' !== typeof available.end) {
                throw new TypeError('PARSE.range: available.end must be ' +
                                    'number.');
            }

            begin = available.begin;
            end = available.end;
        }
        else if ('string' === typeof available) {
            // If the availble points are also only given implicitly,
            // compute set of available numbers by first guessing a bound.
            available = preprocessRange(available);

            numbers = available.match(/([-+]?\d+)/g);
            if (numbers === null) {
                throw new Error(
                    'PARSE.range: no numbers in available: ' + available);
            }
            lowerBound = Math.min.apply(null, numbers);

            available = PARSE.range(available, {
                begin: lowerBound,
                end: Math.max.apply(null, numbers),
                value: lowerBound,
                next: function() {
                    return this.value++;
                },
                isFinished: function() {
                    return this.value > this.end;
                }
            });
            begin = Math.min.apply(null, available);
            end = Math.max.apply(null, available);
        }
        else {
            throw new TypeError('PARSE.range: available must be string, ' +
                                'array, object or undefined.');
        }

        // end -> maximal available value.
        expr = expr.replace(/end/g, parseInt(end, 10));

        // begin -> minimal available value.
        expr = expr.replace(/begin/g, parseInt(begin, 10));

        // Do all computations.
        expr = preprocessRange(expr);

        // Round all floats
        expr = expr.replace(/([-+]?\d+\.\d+)/g, function(match, p1) {
            return parseInt(p1, 10);
        });

        // Validate expression to only contain allowed symbols.
        invalidChars = /[^ \*\d<>=!\|&\.\[\],\(\)\-\+%]/g;
        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }

        // & -> && and | -> ||.
        expr = expr.replace(/([^& ]) *& *([^& ])/g, "$1&&$2");
        expr = expr.replace(/([^| ]) *\| *([^| ])/g, "$1||$2");

        // n -> (x == n).
        expr = expr.replace(/([-+]?\d+)/g, "(x==$1)");

        // n has already been replaced by (x==n) so match for that from now on.

        // %n -> !(x%n)
        expr = expr.replace(/% *\(x==([-+]?\d+)\)/,"!(x%$1)");

        // %n has already been replaced by !(x%n) so match for that from now on.
        // %n = m, %n == m -> (x%n == m).
        expr = expr.replace(/!\(x%([-+]?\d+)\) *={1,} *\(x==([-+]?\d+)\)/g,
            "(x%$1==$2)");

        // <n, <=n, >n, >=n -> (x < n), (x <= n), (x > n), (x >= n)
        expr = expr.replace(/([<>]=?) *\(x==([-+]?\d+)\)/g, "(x$1$2)");

        // n..l..m -> (x >= n && x <= m && !((x-n)%l)) for positive l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(\+?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x>=$1&&x<=$3&&!((x- $1)%$2))");

        // n..l..m -> (x <= n && x >= m && !((x-n)%l)) for negative l.
        expr = expr.replace(
            /\(x==([-+]?\d+)\)\.{2,}\(x==(-\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
            "(x<=$1&&x>=$3&&!((x- $1)%$2))");

        // n..m -> (x >= n && x <= m).
        expr = expr.replace(/\(x==([-+]?\d+)\)\.{2,}\(x==([-+]?\d+)\)/g,
                "(x>=$1&&x<=$2)");

        // (n,m), ... ,[n,m] -> (x > n && x < m), ... , (x >= n && x <= m).
        expr = expr.replace(
            /([(\[]) *\(x==([-+]?\d+)\) *, *\(x==([-+]?\d+)\) *([\])])/g,
                function (match, p1, p2, p3, p4) {
                    return "(x>" + (p1 == '(' ? '': '=') + p2 + "&&x<" +
                        (p4 == ')' ? '' : '=') + p3 + ')';
            }
        );

        // * -> true.
        expr = expr.replace('*', 1);

        // Remove spaces.
        expr = expr.replace(/\s/g, '');

        // a, b -> (a) || (b)
        expr = expr.replace(/\)[,] *(!*)\(/g, ")||$1(");

        // Validating the expression before eval"ing it.
        invalidChars = /[^ \d<>=!\|&,\(\)\-\+%x\.]/g;
        // Only & | ! may be before an opening bracket.
        invalidBeforeOpeningBracket = /[^ &!|\(] *\(/g;
        // Only dot in floats.
        invalidDot = /\.[^\d]|[^\d]\./;

        if (expr.match(invalidChars)) {
            throw new Error('PARSE.range: invalid characters found: ' + expr);
        }
        if (expr.match(invalidBeforeOpeningBracket)) {
            throw new Error('PARSE.range: invalid character before opending ' +
                            'bracket found: ' + expr);
        }
        if (expr.match(invalidDot)) {
            throw new Error('PARSE.range: invalid dot found: ' + expr);
        }

        if (JSUS.isArray(available)) {
            i = -1, len = available.length;
            for ( ; ++i < len ; ) {
                x = parseInt(available[i], 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        else {
            while (!available.isFinished()) {
                x = parseInt(available.next(), 10);
                if (JSUS.eval(expr.replace(/x/g, x))) {
                    solution.push(x);
                }
            }
        }
        return solution;
    };

    function preprocessRange(expr) {
        var mult = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '*' ? n1*n3 : n1/n3;
        };
        var add = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return p2 == '-' ? n1 - n3 : n1 + n3;
        };
        var mod = function(match, p1, p2, p3) {
            var n1 = parseInt(p1, 10);
            var n3 = parseInt(p3, 10);
            return n1 % n3;
        };

        while (expr.match(/([-+]?\d+) *([*\/]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([*\/]) *([-+]?\d+)/, mult);
        }

        while (expr.match(/([-+]?\d+) *([-+]) *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *([-+]) *([-+]?\d+)/, add);
        }
        while (expr.match(/([-+]?\d+) *% *([-+]?\d+)/g)) {
            expr = expr.replace(/([-+]?\d+) *% *([-+]?\d+)/, mod);
        }
        return expr;
    }

    /**
     * ## PARSE.funcName
     *
     * Returns the name of the function
     *
     * Function.name is a non-standard JavaScript property,
     * although many browsers implement it. This is a cross-browser
     * implementation for it.
     *
     * In case of anonymous functions, an empty string is returned.
     *
     * @param {function} func The function to check
     *
     * @return {string} The name of the function
     *
     * Kudos to:
     * http://matt.scharley.me/2012/03/09/monkey-patch-name-ie.html
     */
    if ('undefined' !== typeof Function.prototype.name) {
        PARSE.funcName = function(func) {
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function.');
            }
            return func.name;
        };
    }
    else {
        PARSE.funcName = function(func) {
            var funcNameRegex, res;
            if ('function' !== typeof func) {
                throw new TypeError('PARSE.funcName: func must be function.');
            }
            funcNameRegex = /function\s([^(]{1,})\(/;
            res = (funcNameRegex).exec(func.toString());
            return (res && res.length > 1) ? res[1].trim() : "";
        };
    }

    JSUS.extend(PARSE);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
