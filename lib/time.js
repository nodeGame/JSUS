/**
 * # TIME
 *
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the generation,
 * manipulation, and formatting of time strings in JavaScript
 */
(function (JSUS) {

    function TIME() {}

    /**
     * ## TIME.getDate
     *
     * Returns a string representation of the current date
     * and time formatted as follows:
     *
     * dd-mm-yyyy hh:mm:ss milliseconds
     *
     * @return {string} date Formatted time string hh:mm:ss
     */
    TIME.getDate = TIME.getFullDate = function() {
        var d = new Date();
        var date = d.getUTCDate() + '-' + (d.getUTCMonth()+1) + '-' +
            d.getUTCFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() +
            ':' + d.getSeconds() + ' ' + d.getMilliseconds();

        return date;
    };

    /**
     * ## TIME.getTime
     *
     * Returns a string representation of the current time
     * formatted as follows:
     *
     * hh:mm:ss
     *
     * @return {string} time Formatted time string hh:mm:ss
     */
    TIME.getTime = function() {
        var d = new Date();
        var time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();

        return time;
    };

    /**
     * ## TIME.parseMilliseconds
     *
     * Parses an integer number representing milliseconds,
     * and returns an array of days, hours, minutes and seconds
     *
     * @param {number} ms Integer representing milliseconds
     * @return {array} Milleconds parsed in days, hours, minutes, and seconds
     */
    TIME.parseMilliseconds = function (ms) {
        if ('number' !== typeof ms) return;

        var result = [];
        var x = ms / 1000;
        result[4] = x;
        var seconds = x % 60;
        result[3] = Math.floor(seconds);
        x = x / 60;
        var minutes = x % 60;
        result[2] = Math.floor(minutes);
        x = x / 60;
        var hours = x % 24;
        result[1] = Math.floor(hours);
        x = x / 24;
        var days = x;
        result[1] = Math.floor(days);

        return result;
    };

    JSUS.extend(TIME);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
