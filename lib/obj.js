/**
 * # OBJ
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions to manipulate javascript objects
 *
 */
(function (JSUS) {

    function OBJ(){};

    var compatibility = null;

    if ('undefined' !== typeof JSUS.compatibility) {
        compatibility = JSUS.compatibility();
    }

    /**
     * ## OBJ.equals
     *
     * Checks for deep equality between two objects, string
     * or primitive types.
     *
     * All nested properties are checked, and if they differ
     * in at least one returns FALSE, otherwise TRUE.
     *
     * Takes care of comparing the following special cases:
     *
     * - undefined
     * - null
     * - NaN
     * - Infinity
     * - {}
     * - falsy values
     *
     *
     */
    OBJ.equals = function (o1, o2) {
        var type1 = typeof o1, type2 = typeof o2;

        if (type1 !== type2) return false;

        if ('undefined' === type1 || 'undefined' === type2) {
            return (o1 === o2);
        }
        if (o1 === null || o2 === null) {
            return (o1 === o2);
        }
        if (('number' === type1 && isNaN(o1)) && ('number' === type2 && isNaN(o2)) ) {
            return (isNaN(o1) && isNaN(o2));
        }

        // Check whether arguments are not objects
        var primitives = {number: '', string: '', boolean: ''}
        if (type1 in primitives) {
            return o1 === o2;
        }

        if ('function' === type1) {
            return o1.toString() === o2.toString();
        }

        for (var p in o1) {
            if (o1.hasOwnProperty(p)) {

                if ('undefined' === typeof o2[p] && 'undefined' !== typeof o1[p]) return false;
                if (!o2[p] && o1[p]) return false; // <!-- null -->

                switch (typeof o1[p]) {
                case 'function':
                    if (o1[p].toString() !== o2[p].toString()) return false;

                default:
                    if (!OBJ.equals(o1[p], o2[p])) return false;
                }
            }
        }

        // Check whether o2 has extra properties
        // TODO: improve, some properties have already been checked!
        for (p in o2) {
            if (o2.hasOwnProperty(p)) {
                if ('undefined' === typeof o1[p] && 'undefined' !== typeof o2[p]) return false;
                if (!o1[p] && o2[p]) return false; // <!-- null -->
            }
        }

        return true;
    };

    /**
     * ## OBJ.isEmpty
     *
     * Returns TRUE if an object has no own properties,
     * FALSE otherwise
     *
     * Does not check properties of the prototype chain.
     *
     * @param {object} o The object to check
     * @return {boolean} TRUE, if the object has no properties
     *
     */
    OBJ.isEmpty = function (o) {
        if ('undefined' === typeof o) return true;

        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    };


    /**
     * ## OBJ.size
     *
     * Counts the number of own properties of an object.
     *
     * Prototype chain properties are excluded.
     *
     * @param {object} obj The object to check
     * @return {number} The number of properties in the object
     */
    OBJ.size = OBJ.getListSize = function (obj) {
        if (!obj) return 0;
        if ('number' === typeof obj) return 0;
        if ('string' === typeof obj) return 0;

        var n = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                n++;
            }
        }
        return n;
    };

    /**
     * ## OBJ._obj2Array
     *
     * Explodes an object into an array of keys and values,
     * according to the specified parameters.

     * A fixed level of recursion can be set.
     *
     * @api private
     * @param {object} obj The object to convert in array
     * @param {boolean} keyed TRUE, if also property names should be included. Defaults FALSE
     * @param {number} level Optional. The level of recursion. Defaults undefined
     * @return {array} The converted object
     */
    OBJ._obj2Array = function(obj, keyed, level, cur_level) {
        if ('object' !== typeof obj) return [obj];

        if (level) {
            cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }

        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (keyed) result.push(key);
                if ('object' === typeof obj[key]) {
                    result = result.concat(OBJ._obj2Array(obj[key], keyed, level, cur_level));
                } else {
                    result.push(obj[key]);
                }
            }
        }

        return result;
    };

    /**
     * ## OBJ.obj2Array
     *
     * Converts an object into an array, keys are lost
     *
     * Recursively put the values of the properties of an object into
     * an array and returns it.
     *
     * The level of recursion can be set with the parameter level.
     * By default recursion has no limit, i.e. that the whole object
     * gets totally unfolded into an array.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults, undefined
     * @return {array} The converted object
     *
     *  @see OBJ._obj2Array
     *  @see OBJ.obj2KeyedArray
     *
     */
    OBJ.obj2Array = function (obj, level) {
        return OBJ._obj2Array(obj, false, level);
    };

    /**
     * ## OBJ.obj2KeyedArray
     *
     * Converts an object into array, keys are preserved
     *
     * Creates an array containing all keys and values of an object and
     * returns it.
     *
     * @param {object} obj The object to convert in array
     * @param {number} level Optional. The level of recursion. Defaults, undefined
     * @return {array} The converted object
     *
     * @see OBJ.obj2Array
     *
     */
    OBJ.obj2KeyedArray = OBJ.obj2KeyArray = function (obj, level) {
        return OBJ._obj2Array(obj, true, level);
    };

    /**
     * ## OBJ.keys
     *
     * Scans an object an returns all the keys of the properties,
     * into an array.
     *
     * The second paramter controls the level of nested objects
     * to be evaluated. Defaults 0 (nested properties are skipped).
     *
     * @param {object} obj The object from which extract the keys
     * @param {number} level Optional. The level of recursion. Defaults 0
     * @return {array} The array containing the extracted keys
     *
     *  @see Object.keys
     *
     */
    OBJ.keys = OBJ.objGetAllKeys = function (obj, level, curLevel) {
        if (!obj) return [];
        level = ('number' === typeof level && level >= 0) ? level : 0;
        curLevel = ('number' === typeof curLevel && curLevel >= 0) ? curLevel : 0;
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(key);
                if (curLevel < level) {
                    if ('object' === typeof obj[key]) {
                        result = result.concat(OBJ.objGetAllKeys(obj[key], (curLevel+1)));
                    }
                }
            }
        }
        return result;
    };

    /**
     * ## OBJ.implode
     *
     * Separates each property into a new objects and returns
     * them into an array
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c: {a:1}, e:5 };
     * OBJ.implode(a); // [{b:2}, {c:{a:1}}, {e:5}]
     * ```
     *
     * @param {object} obj The object to implode
     * @return {array} result The array containig all the imploded properties
     *
     */
    OBJ.implode = OBJ.implodeObj = function (obj) {
        if (!obj) return [];
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var o = {};
                o[key] = obj[key];
                result.push(o);
            }
        }
        return result;
    };

    /**
     * ## OBJ.clone
     *
     * Creates a perfect copy of the object passed as parameter
     *
     * Recursively scans all the properties of the object to clone.
     * Properties of the prototype chain are copied as well.
     *
     * Primitive types and special values are returned as they are.
     *
     * @param {object} obj The object to clone
     * @return {object} clone The clone of the object
     */
    OBJ.clone = function (obj) {
        if (!obj) return obj;
        if ('number' === typeof obj) return obj;
        if ('string' === typeof obj) return obj;
        if ('boolean' === typeof obj) return obj;
        if (obj === NaN) return obj;
        if (obj === Infinity) return obj;

        var clone;
        if ('function' === typeof obj) {
            //          clone = obj;
            // <!-- Check when and if we need this -->
            clone = function() { return obj.apply(clone, arguments); };
        }
        else {
            clone = (Object.prototype.toString.call(obj) === '[object Array]') ? [] : {};
        }

        for (var i in obj) {
            var value;
            // TODO: index i is being updated, so apply is called on the
            // last element, instead of the correct one.
            //          if ('function' === typeof obj[i]) {
            //                  value = function() { return obj[i].apply(clone, arguments); };
            //          }
            // It is not NULL and it is an object
            if (obj[i] && 'object' === typeof obj[i]) {
                // is an array
                if (Object.prototype.toString.call(obj[i]) === '[object Array]') {
                    value = obj[i].slice(0);
                }
                // is an object
                else {
                    value = OBJ.clone(obj[i]);
                }
            }
            else {
                value = obj[i];
            }

            if (obj.hasOwnProperty(i)) {
                clone[i] = value;
            }
            else {
                // we know if object.defineProperty is available
                if (compatibility && compatibility.defineProperty) {
                    Object.defineProperty(clone, i, {
                        value: value,
                        writable: true,
                        configurable: true
                    });
                }
                else {
                    // or we try...
                    try {
                        Object.defineProperty(clone, i, {
                            value: value,
                            writable: true,
                            configurable: true
                        });
                    }
                    catch(e) {
                        clone[i] = value;
                    }
                }
            }
        }
        return clone;
    };

    /**
     * ## OBJ.join
     *
     * Performs a *left* join on the keys of two objects
     *
     * Creates a copy of obj1, and in case keys overlap
     * between obj1 and obj2, the values from obj2 are taken.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, e:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.join(a, b); // { b:2, c:100, e:5 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     * @return {object} clone The joined object
     *
     *  @see OBJ.merge
     */
    OBJ.join = function (obj1, obj2) {
        var clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (var i in clone) {
            if (clone.hasOwnProperty(i)) {
                if ('undefined' !== typeof obj2[i]) {
                    if ('object' === typeof obj2[i]) {
                        clone[i] = OBJ.join(clone[i], obj2[i]);
                    } else {
                        clone[i] = obj2[i];
                    }
                }
            }
        }
        return clone;
    };

    /**
     * ## OBJ.merge
     *
     * Merges two objects in one
     *
     * In case keys overlap the values from obj2 are taken.
     *
     * Only own properties are copied.
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.merge(a, b); // { a: 10, b: 2, c: 100, d: 4 }
     * ```
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     * @return {object} clone The merged object
     *
     *  @see OBJ.join
     *  @see OBJ.mergeOnKey
     */
    OBJ.merge = function (obj1, obj2) {
        // Checking before starting the algorithm
        if (!obj1 && !obj2) return false;
        if (!obj1) return OBJ.clone(obj2);
        if (!obj2) return OBJ.clone(obj1);

        var clone = OBJ.clone(obj1);
        for (var i in obj2) {

            if (obj2.hasOwnProperty(i)) {
                // it is an object and it is not NULL
                if ( obj2[i] && 'object' === typeof obj2[i] ) {
                    // If we are merging an object into
                    // a non-object, we need to cast the
                    // type of obj1
                    if ('object' !== typeof clone[i]) {
                        if (Object.prototype.toString.call(obj2[i]) === '[object Array]') {
                            clone[i] = [];
                        }
                        else {
                            clone[i] = {};
                        }
                    }
                    clone[i] = OBJ.merge(clone[i], obj2[i]);
                } else {
                    clone[i] = obj2[i];
                }
            }
        }

        return clone;
    };

    /**
     * ## OBJ.mixin
     *
     * Adds all the properties of obj2 into obj1
     *
     * Original object is modified
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixin = function (obj1, obj2) {
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;

        for (var i in obj2) {
            obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mixout
     *
     * Copies only non-overlapping properties from obj2 to obj1
     *
     * Original object is modified
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixout = function (obj1, obj2) {
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;

        for (var i in obj2) {
            if (!obj1[i]) obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mixcommon
     *
     * Copies only overlapping properties from obj2 to obj1
     *
     * Original object is modified
     *
     * @param {object} obj1 The object to which the new properties will be added
     * @param {object} obj2 The mixin-in object
     */
    OBJ.mixcommon = function (obj1, obj2) {
        if (!obj1 && !obj2) return;
        if (!obj1) return obj2;
        if (!obj2) return obj1;

        for (var i in obj2) {
            if (obj1[i]) obj1[i] = obj2[i];
        }
    };

    /**
     * ## OBJ.mergeOnKey
     *
     * Appends / merges the values of the properties of obj2 into a
     * a new property named 'key' in obj1.
     *
     * Returns a new object, the original ones are not modified.
     *
     * This method is useful when we want to merge into a larger
     * configuration (e.g. min, max, value) object another one that
     * contains just the values for one of the properties (e.g. value).
     *
     * @param {object} obj1 The object where the merge will take place
     * @param {object} obj2 The merging object
     * @param {string} key The name of property under which merging the second object
     * @return {object} clone The merged object
     *
     *  @see OBJ.merge
     *
     */
    OBJ.mergeOnKey = function (obj1, obj2, key) {
        var clone = OBJ.clone(obj1);
        if (!obj2 || !key) return clone;
        for (var i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if (!clone[i] || 'object' !== typeof clone[i]) {
                    clone[i] = {};
                }
                clone[i][key] = obj2[i];
            }
        }
        return clone;
    };

    /**
     * ## OBJ.subobj
     *
     * Creates a copy of an object containing only the properties
     * passed as second parameter
     *
     * The parameter select can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be used first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} select The selection of properties to extract
     * @return {object} out The subobject with the properties from the parent one
     *
     *  @see OBJ.getNestedValue
     */
    OBJ.subobj = function (o, select) {
        var out, i, key
        if (!o) return false;
        out = {};
        if (!select) return out;
        if (!(select instanceof Array)) select = [select];
        for (i=0; i < select.length; i++) {
            key = select[i];
            if (o.hasOwnProperty(key)) {
                out[key] = o[key];
            }
            else if (OBJ.hasOwnNestedProperty(key, o)) {
                OBJ.setNestedValue(key, OBJ.getNestedValue(key, o), out);
            }
        }
        return out;
    };

    /**
     * ## OBJ.skim
     *
     * Creates a copy of an object where a set of selected properties
     * have been removed
     *
     * The parameter `remove` can be an array of strings, or the name
     * of a property.
     *
     * Use '.' (dot) to point to a nested property, however if a property
     * with a '.' in the name is found, it will be deleted first.
     *
     * @param {object} o The object to dissect
     * @param {string|array} remove The selection of properties to remove
     * @return {object} out The subobject with the properties from the parent one
     *
     * @see OBJ.getNestedValue
     */
    OBJ.skim = function (o, remove) {
        var out, i;
        if (!o) return false;
        out = OBJ.clone(o);
        if (!remove) return out;
        if (!(remove instanceof Array)) remove = [remove];
        for (i = 0; i < remove.length; i++) {
            if (out.hasOwnProperty(i)) {
                delete out[i];
            }
            else {
                OBJ.deleteNestedKey(remove[i], out);
            }
        }
        return out;
    };


    /**
     * ## OBJ.setNestedValue
     *
     * Sets the value of a nested property of an object,
     * and returns it.
     *
     * If the object is not passed a new one is created.
     * If the nested property is not existing, a new one is created.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * @param {string} str The path to the value
     * @param {mixed} value The value to set
     * @return {object|boolean} obj The modified object, or FALSE if error occurred
     *
     * @see OBJ.getNestedValue
     * @see OBJ.deleteNestedKey
     *
     */
    OBJ.setNestedValue = function (str, value, obj) {
        var keys, k;
        if (!str) {
            JSUS.log('Cannot set value of undefined property', 'ERR');
            return false;
        }
        obj = ('object' === typeof obj) ? obj : {};
        keys = str.split('.');
        if (keys.length === 1) {
            obj[str] = value;
            return obj;
        }
        k = keys.shift();
        obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]);
        return obj;
    };

    /**
     * ## OBJ.getNestedValue
     *
     * Returns the value of a property of an object, as defined
     * by a path string.
     *
     * Use '.' (dot) to point to a nested property.
     *
     * Returns undefined if the nested property does not exist.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.getNestedValue('b.a', o); // 2
     * ```
     *
     * @param {string} str The path to the value
     * @param {object} obj The object from which extract the value
     * @return {mixed} The extracted value
     *
     * @see OBJ.setNestedValue
     * @see OBJ.deleteNestedKey
     */
    OBJ.getNestedValue = function (str, obj) {
        if (!obj) return;
        var keys = str.split('.');
        if (keys.length === 1) {
            return obj[str];
        }
        var k = keys.shift();
        return OBJ.getNestedValue(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.deleteNestedKey
     *
     * Deletes a property from an object, as defined by a path string
     *
     * Use '.' (dot) to point to a nested property.
     *
     * The original object is modified.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.deleteNestedKey('b.a', o); // { a:1, b: {} }
     * ```
     *
     * @param {string} str The path string
     * @param {object} obj The object from which deleting a property
     * @param {boolean} TRUE, if the property was existing, and then deleted
     *
     * @see OBJ.setNestedValue
     * @see OBJ.getNestedValue
     */
    OBJ.deleteNestedKey = function (str, obj) {
        if (!obj) return;
        var keys = str.split('.');
        if (keys.length === 1) {
            delete obj[str];
            return true;
        }
        var k = keys.shift();
        if ('undefined' === typeof obj[k]) {
            return false;
        }
        return OBJ.deleteNestedKey(keys.join('.'), obj[k]);
    };

    /**
     * ## OBJ.hasOwnNestedProperty
     *
     * Returns TRUE if a (nested) property exists
     *
     * Use '.' to specify a nested property.
     *
     * E.g.
     *
     * ```javascript
     * var o = { a:1, b:{a:2} };
     * OBJ.hasOwnNestedProperty('b.a', o); // TRUE
     * ```
     *
     * @param {string} str The path of the (nested) property
     * @param {object} obj The object to test
     * @return {boolean} TRUE, if the (nested) property exists
     *
     */
    OBJ.hasOwnNestedProperty = function (str, obj) {
        if (!obj) return false;
        var keys = str.split('.');
        if (keys.length === 1) {
            return obj.hasOwnProperty(str);
        }
        var k = keys.shift();
        return OBJ.hasOwnNestedProperty(keys.join('.'), obj[k]);
    };


    /**
     * ## OBJ.split
     *
     * Splits an object along a specified dimension, and returns
     * all the copies in an array.
     *
     * It creates as many new objects as the number of properties
     * contained in the specified dimension. The object are identical,
     * but for the given dimension, which was split. E.g.
     *
     * ```javascript
     *  var o = { a: 1,
     *            b: {c: 2,
     *                d: 3
     *            },
     *            e: 4
     *  };
     *
     *  o = OBJ.split(o, 'b');
     *
     *  // o becomes:
     *
     *  [{ a: 1,
     *     b: {c: 2},
     *     e: 4
     *  },
     *  { a: 1,
     *    b: {d: 3},
     *    e: 4
     *  }];
     * ```
     *
     * @param {object} o The object to split
     * @param {sting} key The name of the property to split
     * @return {object} A copy of the object with split values
     */
    OBJ.split = function (o, key) {
        if (!o) return;
        if (!key || 'object' !== typeof o[key]) {
            return JSUS.clone(o);
        }

        var out = [];
        var model = JSUS.clone(o);
        model[key] = {};

        var splitValue = function (value) {
            for (var i in value) {
                var copy = JSUS.clone(model);
                if (value.hasOwnProperty(i)) {
                    if ('object' === typeof value[i]) {
                        out = out.concat(splitValue(value[i]));
                    }
                    else {
                        copy[key][i] = value[i];
                        out.push(copy);
                    }
                }
            }
            return out;
        };

        return splitValue(o[key]);
    };

    /**
     * ## OBJ.melt
     *
     * Creates a new object with the specified combination of
     * properties - values
     *
     * The values are assigned cyclically to the properties, so that
     * they do not need to have the same length. E.g.
     *
     * ```javascript
     *  J.createObj(['a','b','c'], [1,2]); // { a: 1, b: 2, c: 1 }
     * ```
     * @param {array} keys The names of the keys to add to the object
     * @param {array} values The values to associate to the keys
     * @return {object} A new object with keys and values melted together
     */
    OBJ.melt = function(keys, values) {
        var o = {}, valen = values.length;
        for (var i = 0; i < keys.length; i++) {
            o[keys[i]] = values[i % valen];
        }
        return o;
    };

    /**
     * ## OBJ.uniqueKey
     *
     * Creates a random unique key name for a collection
     *
     * User can specify a tentative unique key name, and if already
     * existing an incremental index will be added as suffix to it.
     *
     * Notice: the method does not actually create the key
     * in the object, but it just returns the name.
     *
     * @param {object} obj The collection for which a unique key name will be created
     * @param {string} name Optional. A tentative key name. Defaults, a 10-digit random number
     * @param {number} stop Optional. The number of tries before giving up searching
     *  for a unique key name. Defaults, 1000000.
     *
     * @return {string|undefined} The unique key name, or undefined if it was not found
     */
    OBJ.uniqueKey = function(obj, name, stop) {
        if (!obj) {
            JSUS.log('Cannot find unique name in undefined object', 'ERR');
            return;
        }
        name = name || '' + Math.floor(Math.random()*10000000000);
        stop = stop || 1000000;
        var duplicateCounter = 1;
        while (obj[name]) {
            name = name + '' + duplicateCounter;
            duplicateCounter++;
            if (duplicateCounter > stop) {
                return;
            }
        }
        return name;
    }

    /**
     * ## OBJ.augment
     *
     * Pushes the values of the properties of an object into another one
     *
     * User can specifies the subset of keys from both objects
     * that will subject to augmentation. The values of the other keys
     * will not be changed
     *
     * Notice: the method modifies the first input paramteer
     *
     * E.g.
     *
     * ```javascript
     * var a = { a:1, b:2, c:3 };
     * var b = { a:10, b:2, c:100, d:4 };
     * OBJ.augment(a, b); // { a: [1, 10], b: [2, 2], c: [3, 100]}
     *
     * OBJ.augment(a, b, ['b', 'c', 'd']); // { a: 1, b: [2, 2], c: [3, 100], d: [4]});
     *
     * ```
     *
     * @param {object} obj1 The object whose properties will be augmented
     * @param {object} obj2 The augmenting object
     * @param {array} key Optional. Array of key names common to both objects taken as
     *  the set of properties to augment
     */
    OBJ.augment = function(obj1, obj2, keys) {
        var i, k, keys = keys || OBJ.keys(obj1);

        for (i = 0 ; i < keys.length; i++) {
            k = keys[i];
            if ('undefined' !== typeof obj1[k] && Object.prototype.toString.call(obj1[k]) !== '[object Array]') {
                obj1[k] = [obj1[k]];
            }
            if ('undefined' !== obj2[k]) {
                if (!obj1[k]) obj1[k] = [];
                obj1[k].push(obj2[k]);
            }
        }
    }


    /**
     * ## OBJ.pairwiseWalk
     *
     * Given two objects, executes a callback on all attributes with the same name
     *
     * The results of each callback are aggregated in a new object under the
     * same property name.
     *
     * Does not traverse nested objects, and properties of the prototype are excluded
     *
     * Returns a new object, the original ones are not modified.
     *
     * E.g.
     *
     * ```javascript
     * var a = { b:2, c:3, d:5 };
     * var b = { a:10, b:2, c:100, d:4 };
     * var sum = function(a,b) {
     *     if ('undefined' !== typeof a) {
     *         return 'undefined' !== typeof b ? a + b : a;
     *     }
     *     return b;
     * };
     * OBJ.pairwiseWalk(a, b, sum); // { a:10, b:4, c:103, d:9 }
     * ```
     *
     * @param {object} o1 The first object
     * @param {object} o2 The second object
     * @return {object} clone The object aggregating the results
     *
     */
    OBJ.pairwiseWalk = function(o1, o2, cb) {
        var i, out;
        if (!o1 && !o2) return;
        if (!o1) return o2;
        if (!o2) return o1;

        out = {};
        for (i in o1) {
            if (o1.hasOwnProperty(i)) {
                out[i] = o2.hasOwnProperty(i) ? cb(o1[i], o2[i]) : cb(o1[i]);
            }
        }

        for (i in o2) {
            if (o2.hasOwnProperty(i)) {
                if ('undefined' === typeof out[i]) {
                    out[i] = cb(undefined, o2[i]);
                }
            }
        }

        return out;
    };


    JSUS.extend(OBJ);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);