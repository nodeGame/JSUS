/**
 * # EVAL
 *
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the evaluation
 * of strings as JavaScript commands
 */
(function(JSUS) {

    function EVAL(){};

    /**
     * ## EVAL.eval
     *
     * Cross-browser eval function with context.
     *
     * If no context is passed a reference, `this` is used.
     *
     * In old IEs it will use _window.execScript_ instead.
     *
     * @param {string} str The command to executes
     * @param {object} context Optional. Execution context. Defaults, `this`
     * @return {mixed} The return value of the executed commands
     *
     * @see eval
     * @see execScript
     * @see JSON.parse
     */
    EVAL.eval = function(str, context) {
        var func;
        if (!str) return;
        context = context || this;
        // Eval must be called indirectly
        // i.e. eval.call is not possible
        func = function(str) {
            // TODO: Filter str.
            str = '(' + str + ')';
            if ('undefined' !== typeof window && window.execScript) {
                // Notice: execScript doesn’t return anything.
                window.execScript('__my_eval__ = ' + str);
                return __my_eval__;
            }
            else {
                return eval(str);
            }
        }
        return func.call(context, str);
    };

    JSUS.extend(EVAL);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
