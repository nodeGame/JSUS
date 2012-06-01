(function (JSUS) {

    /**
     *
     *    OBJ: functions working with js objects.
     * 
     * 
     */
    
    function OBJ(){};

    /**
     * Checks for deep equality between two objects, 
     * string or primitive types.
     * 
     * All nested properties are checked, and if they differ 
     * in at least one returns FALSE, otherwise TRUE.
     * 
     */
    OBJ.equals = function (o1, o2) {
        if (!o1 || !o2) return false;
          
        // Check whether arguments are not objects
        if ( typeof o1 in {number:'',string:''}) {
            if ( typeof o2 in {number:'',string:''}) {
                return (o1 === o2);
            }
            return false;
        } else if ( typeof o2 in {number:'',string:''}) {
            return false;
        }
        
        for (var p in o1) {
            if (o1.hasOwnProperty(p)) {
              
                if ('undefined' === typeof o2[p] && 'undefined' !== typeof o1[p]) return false;
              
                switch (typeof o1[p]) {
                    case 'object':
                        if (!OBJ.equals(o1[p],o2[p])) return false;
                        
                    case 'function':
                        if (o1[p].toString() !== o2[p].toString()) return false;
                        
                    default:
                        if (o1[p] !== o2[p]) return false; 
              }
          } 
      }
  
      // Check whether o2 has extra properties
      // TODO: improve, some properties have already been checked!
      for (p in o2) {
          if (o2.hasOwnProperty(p)) {
              if ('undefined' === typeof o1[p] && 'undefined' !== typeof o2[p])
                  return false;
          }
      }
    
      return true;
    };
    
    /**
     * Returns TRUE if an object has no properties, 
     * FALSE otherwise.
     * 
     */
    OBJ.isEmpty(o) {
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
            	return false;
            }
        }

        return true;
    };

    /**
     * Returns the number of own properties, prototype
     * chain excluded, stored in the object / list.
     * 
     */
    OBJ.getListSize = OBJ.getOwnPropertiesSize = function (list) {    
        var n = 0;
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                n++;
            }
        }
        return n;
    };
    
    /**
     * Explodes an object into an array of keys and values,
     * according to the specified parameters. 
     * A fixed level of recursion can be set.
     * 
     * @api private
     * 
     */
    OBJ._obj2Array = function(obj, keyed, level, cur_level) {
        if ('object' !== typeof obj) return [obj];
        
        if (level) {
            var cur_level = ('undefined' !== typeof cur_level) ? cur_level : 1;
            if (cur_level > level) return [obj];
            cur_level = cur_level + 1;
        }
        
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if ( 'object' === typeof obj[key] ) {
                    result = result.concat(OBJ._obj2Array(obj[key], keyed, level, cur_level));
                } else {
                    if (keyed) result.push(key);
                    result.push(obj[key]);
                }
               
            }
        }        
        return result;
    };
    
    /**
     * Recursively put the values of the properties of an object into 
     * an array and returns it. The level of recursion can be set with the 
     * parameter level, by default recursion has no limit. That means that
     * the whole object gets totally unfolded into an array.
     * 
     * @see OBJ._obj2Array
     * @see OBJ._obj2KeyedArray
     * 
     */
    OBJ.obj2Array = function (obj, level) {
        return OBJ._obj2Array(obj, false, level);
    };
    
    /**
     * Creates an array containing all keys and values of an object and 
     * returns it.
     * 
     * @see OBJ.obj2Array 
     * 
     */
    OBJ.obj2KeyedArray = OBJ.obj2KeyArray = function (obj, level) {
        return OBJ._obj2Array(obj, true, level);
    };
    
    /**
     * Scans an object an returns all the keys of the properties,
     * into an array. Nested objects are also evaluated.
     * 
     */
    OBJ.objGetAllKeys = function (obj) {
        var result = [];
        for (var key in obj) {
           if (obj.hasOwnProperty(key)) {
               result.push(key);
               if ('object' === typeof obj[key]) {
                   result = result.concat(OBJ.objGetAllKeys(obj[key]));
               }
           }
        }
        return result;
    };
    
    /**
     * Creates an array of key:value objects.
     * 
     */
    OBJ.implodeObj = function (obj) {
        //console.log(obj);
        var result = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var o = {};
                o[key] = obj[key];
                result.push(o);
                //console.log(o);
            }
        }
        return result;
    };
    
//  /**
//  * Creates a perfect copy of the object passed as parameter.
//  * 
//  * @deprecated
//  * 
//  */
// OBJ.clone_old = function (obj) {
//     if (!obj) return;
//     var clone = {};
//     for (var i in obj) {
//         //if (obj.hasOwnProperty(i)) {
//             if ( 'object' === typeof obj[i] ) {
//                 clone[i] = OBJ.clone(obj[i]);
//             } else {
//                 clone[i] = obj[i];
//             }
//         //}
//     }
//     return clone;
// };
 
 /**
  * Creates a perfect copy of the object passed as parameter.
  * 
  */
 OBJ.clone = function (obj) {

     if (!obj) return;
     var clone = {};
     for (var i in obj) {
     	
     	var value = ('object' === typeof obj[i]) ? OBJ.clone(obj[i])
					 								 : obj[i];
     	
         if (obj.hasOwnProperty(i)) {
         	clone[i] = value;
         }
         else {
         	
        	 // Does not work
//         	if ('undefined' === typeof clone.prototype) {
//         		Object.defineProperty(clone, 'prototype', {
//         			value: {},
//         			writable: true,
//           		  	configurable: true,
//           		});
//         	}
         	
         	Object.defineProperty(clone, i, {
         		 value: value,
         		 writable: true,
         		 configurable: true,
         	});
         	
         }
     }
     return clone;
 };
    
    /**
     * Performs a *left* join on the keys of two objects. In case keys overlaps 
     * the values from obj2 are taken.
     *  
     */
    OBJ.join = function (obj1, obj2) {
        var clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (var i in clone) {
            if (clone.hasOwnProperty(i)) {
                if ('undefined' !== typeof obj2[i]) {
                    if ( 'object' === typeof obj2[i] ) {
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
     * Merges two objects in one. In case keys overlaps the values from 
     * obj2 are taken. 
     * 
     * Returns a new object, the original ones are not modified.
     * 
     */
    OBJ.merge = function (obj1, obj2) {
        var clone = OBJ.clone(obj1);
        if (!obj2) return clone;
        for (var i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if ( 'object' === typeof obj2[i] ) {
                    clone[i] = OBJ.merge(obj1[i],obj2[i]);
                } else {
                    clone[i] = obj2[i];
                }
            }
        }
        return clone;
    };
    
    /**
     * Like OBJ.merge, but only overlapping keys are copied.
     * 
     * Returns a new object, the original ones are not modified.
     * 
     * @see OBJ.merge
     * 
     */
    OBJ.mergeOnKey = function (obj1, obj2, key) {
        var clone = OBJ.clone(obj1);
        if (!obj2 || !key) return clone;        
        for (var i in obj2) {
            if (obj2.hasOwnProperty(i)) {
                if ( 'object' === typeof obj1[i] ) {
                    clone[i][key] = obj2[i];
                }
            }
        }
        return clone;
    };
    
    /**
     * Merges on key called 'value'.
     * 
     * @see OBJ.mergeOnKey
     * 
     * @deprecated
     * 
     */
    OBJ.mergeOnValue = function (obj1, obj2) {
        return OBJ.mergeOnKey(obj1, obj2, 'value');
    };
    
    /**
     * Creates a copy of an object containing only the 
     * properties passed as second parameter.
     * 
     * The parameter select can be an array of strings, 
     * or the name of a property.
     * 
     */
    OBJ.subobj = function (o, select) {
        if (!o) return false;
        var out = {};
        if (!select) return out;
        if (!(select instanceof Array)) select = [select];
        for (var i=0; i<select.length;i++) {
            var key = select[i];
            if ('undefined' !== typeof o[key]) {
                out[key] = o[key];
            }
        }
        return out;
    };
        
    
    /**
     * Sets the value of a nested property of an object, 
     * and returns it.
     * 
     * If the object is not passed a new one is created.
     * If the nested property is not existing, a new one
     * is created. 
     * 
     * The original object is modified.
     * 
     */
    OBJ.setNestedValue = function (str, value, obj) {
        var obj = obj || {};
        var keys = str.split('.');
        if (keys.length === 1) {
            obj[str] = value;
            return obj;
        }
        var k = keys.shift();
        obj[k] = OBJ.setNestedValue(keys.join('.'), value, obj[k]); 
        return obj;
    };
    
    /**
     * Returns the value of a property of an object, as defined
     * by the input string. The string can contains '.', and in that
     * case the method looks for nested objects.
     *  
     * Returns undefined if the nested key is not found.
     * 
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

    JSUS.extend(OBJ);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);