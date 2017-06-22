/**
 * # TIME
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the generation,
 * manipulation, and formatting of time strings in JavaScript
 */
(function (JSUS) {

    "use strict";

    function TIME() {}

    // Polyfill for Date.toISOString (IE7, IE8, IE9)
    // Kudos: https://developer.mozilla.org/en-US/docs/Web/
    // JavaScript/Reference/Global_Objects/Date/toISOString
    if (!Date.prototype.toISOString) {
        (function() {

            function pad(number) {
                return (number < 10) ? '0' + number : number;
            }

            Date.prototype.toISOString = function() {
                var ms = (this.getUTCMilliseconds() / 1000).toFixed(3);
                return this.getUTCFullYear() +
                    '-' + pad(this.getUTCMonth() + 1) +
                    '-' + pad(this.getUTCDate()) +
                    'T' + pad(this.getUTCHours()) +
                    ':' + pad(this.getUTCMinutes()) +
                    ':' + pad(this.getUTCSeconds()) +
                    '.' + ms.slice(2, 5) + 'Z';
            };

        }());
    }

    /**
     * ## TIME.getDate
     *
     * Returns a string representation of the current date and time (ISO)
     *
     * String is formatted as follows:
     *
     * YYYY-MM-DDTHH:mm:ss.sssZ
     *
     * @return {string} Formatted time string YYYY-MM-DDTHH:mm:ss.sssZ
     */
    TIME.getDate = TIME.getFullDate = function() {
        return new Date().toISOString();
    };

    /**
     * ## TIME.getTime
     *
     * Returns a string representation of the current time
     *
     * String is ormatted as follows:
     *
     * hh:mm:ss
     *
     * @return {string} Formatted time string hh:mm:ss
     *
     * @see TIME.getTimeM
     */
    TIME.getTime = function() {
        var d;
        d = new Date();
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    };

    /**
     * ## TIME.getTimeM
     *
     * Like TIME.getTime, but with millisecondsx
     *
     * String is ormatted as follows:
     *
     * hh:mm:ss:mls
     *
     * @return {string} Formatted time string hh:mm:ss:mls
     *
     * @see TIME.getTime
     */
    TIME.getTimeM = function() {
        var d;
        d = new Date();
        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +
            ':' + d.getMilliseconds();
    };

    /**
     * ## TIME.parseMilliseconds
     *
     * Parses milliseconds into an array of days, hours, minutes and seconds
     *
     * @param {number} ms Integer representing milliseconds
     *
     * @return {array} Milleconds parsed in days, hours, minutes, and seconds
     */
    TIME.parseMilliseconds = function(ms) {
        var result, x, seconds, minutes, hours, days;
        if ('number' !== typeof ms) {
            throw new TypeError('TIME.parseMilliseconds: ms must be number.');
        }
        result = [];
        x = ms / 1000;
        result[4] = x;
        seconds = x % 60;
        result[3] = Math.floor(seconds);
        x = x / 60;
        minutes = x % 60;
        result[2] = Math.floor(minutes);
        x = x / 60;
        hours = x % 24;
        result[1] = Math.floor(hours);
        x = x / 24;
        days = x;
        result[1] = Math.floor(days);
        return result;
    };


    /**
     * ## TIME.now
     *
     * Shortcut to Date.now (when existing), or its polyfill
     *
     * @return {number} The timestamp now
     */
    TIME.now = 'function' === typeof Date.now ?
        Date.now : function() { return new Date().getTime(); }

    JSUS.extend(TIME);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
