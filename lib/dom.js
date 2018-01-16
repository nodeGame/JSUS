/**
 * # DOM
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Helper library to perform generic operation with DOM elements.
 */
(function(JSUS) {

    "use strict";

    var onFocusChange, changeTitle;

    function DOM() {}

    // ## GET/ADD

    /**
     * ### DOM.get
     *
     * Creates a generic HTML element with specified attributes
     *
     * @param {string} elem The name of the tag
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element. If
     *   the request element is an 'iframe', the `name` attribute is set
     *   equal to the `id` attribute.
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.add
     * @see DOM.addAttributes
     */
    DOM.get = function(name, attributes) {
        var el;
        el = document.createElement(name);
        if ('string' === typeof attributes) el.id = attributes;
        else if (attributes) this.addAttributes(el, attributes);
        // For firefox, name of iframe must be set as well.
        if (name === 'iframe' && el.id && !el.name) el.name = el.id;
        return el;
    };

    /**
     * ### DOM.add|append
     *
     * Creates and append an element with specified attributes to a root
     *
     * @param {string} name The name of the HTML tag
     * @param {HTMLElement} root The root element to which the new element
     *   will be appended
     * @param {object|string} options Optional. Object containing
     *   attributes for the element and rules about how to insert it relative
     *   to root. Available options: insertAfter, insertBefore (default:
     *   child of root). If string, it is the id of the element. Examples:
     *
     * ```javascript
     * // Appends a new new to the body.
     * var div = DOM.add('div', document.body);
     * // Appends a new new to the body with id 'myid'.
     * var div1 = DOM.add('div', document.body, 'myid');
     * // Appends a new new to the body with id 'myid2' and class name 'c'.
     * var div2 = DOM.add('div', document.body, { id: 'myid2', className: 'c'});
     * // Appends a new div after div1 with id 'myid'.
     * var div3 = DOM.add('div', div1, { id: 'myid3', insertAfter: true });
     * // Appends a new div before div2 with id 'myid'.
     * var div3 = DOM.add('div', div2, { id: 'myid3', insertBefore: true });
     * ```
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.get
     * @see DOM.addAttributes
     */
    DOM.add = DOM.append = function(name, root, options) {
        var el;
        el = this.get(name, options);
        if (options && options.insertBefore) {
            if (options.insertAfter) {
                throw new Error('DOM.add: options.insertBefore and ' +
                                'options.insertBefore cannot be ' +
                                'both set.');
            }
            if (!root.parentNode) {
                throw new Error('DOM.add: root.parentNode not found. ' +
                                'Cannot insert before.');
            }
            root.parentNode.insertBefore(el, root);
        }
        else if (options && options.insertAfter) {
            if (!root.parentNode) {
                throw new Error('DOM.add: root.parentNode not found. ' +
                                'Cannot insert after.');
            }
            DOM.insertAfter(el, root);
        }
        else {
            root.appendChild(el);
        }
        return el;
    };

    /**
     * ### DOM.addAttributes
     *
     * Adds attributes to an HTML element and returns it
     *
     * Attributes are defined as key-values pairs and added
     *
     * Special cases:
     *
     *   - 'className': alias for class
     *   - 'class': add a class to the className property (does not overwrite)
     *   - 'style': adds property to the style property (see DOM.style)
     *   - 'id': the id of the element
     *   - 'innerHTML': the innerHTML property of the element (overwrites)
     *   - 'insertBefore': ignored
     *   - 'insertAfter': ignored
     *
     * @param {HTMLElement} elem The element to decorate
     * @param {object} attributes Object containing attributes to
     *   add to the element
     *
     * @return {HTMLElement} The element with speficied attributes added
     *
     * @see DOM.addClass
     * @see DOM.style
     */
     DOM.addAttributes = function(elem, attributes) {
        var key;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.addAttributes: elem must be ' +
                                'HTMLElement. Found: ' + elem);
        }
        if ('undefined' === typeof attributes) return elem;
        if ('object' !== typeof attributes) {
            throw new TypeError('DOM.addAttributes: attributes must be ' +
                                'object or undefined. Found: ' + attributes);
        }
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                if (key === 'id' || key === 'innerHTML') {
                    elem[key] = attributes[key];
                }
                else if (key === 'class' || key === 'className') {
                    DOM.addClass(elem, attributes[key]);
                }
                else if (key === 'style') {
                    DOM.style(elem, attributes[key]);
                }
                else if (key !== 'insertBefore' && key !== 'insertAfter') {
                    elem.setAttribute(key, attributes[key]);
                }
            }
        }
        return elem;
    };

    // ## WRITE

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into a root element
     *
     * @param {HTMLElement} root The HTML element where to write into
     * @param {string|HTMLElement} text The text to write or an element
     *    to append. Default: an ampty string
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.writeln
     */
    DOM.write = function(root, text) {
        var content;
        if ('undefined' === typeof text || text === null) text = "";
        if (JSUS.isNode(text) || JSUS.isElement(text)) content = text;
        else content = document.createTextNode(text);
        root.appendChild(content);
        return content;
    };

    /**
     * ### DOM.writeln
     *
     * Write a text and a break into a root element
     *
     * Default break element is <br> tag
     *
     * @param {HTMLElement} root The HTML element where to write into
     * @param {string|HTMLElement} text The text to write or an element
     *    to append. Default: an ampty string
     * @param {string} rc the name of the tag to use as a break element
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.write
     */
    DOM.writeln = function(root, text, rc) {
        var content;
        content = DOM.write(root, text);
        this.add(rc || 'br', root);
        return content;
    };

    /**
     * ### DOM.sprintf
     *
     * Builds up a decorated HTML text element
     *
     * Performs string substitution from an args object where the first
     * character of the key bears the following semantic:
     *
     * - '@': variable substitution with escaping
     * - '!': variable substitution without variable escaping
     * - '%': wraps a portion of string into a _span_ element to which is
     *        possible to associate a css class or id. Alternatively,
     *        it also possible to add in-line style. E.g.:
     *
     * ```javascript
     *      sprintf('%sImportant!%s An error has occurred: %pre@err%pre', {
     *              '%pre': {
     *                      style: 'font-size: 12px; font-family: courier;'
     *              },
     *              '%s': {
     *                      id: 'myId',
     *                      'class': 'myClass',
     *              },
     *              '@err': 'file not found',
     *      }, document.body);
     * ```
     *
     * Special span elements are %strong and %em, which add
     * respectively a _strong_ and _em_ tag instead of the default
     * _span_ tag. They cannot be styled.
     *
     * @param {string} string A text to transform
     * @param {object} args Optional. An object containing string
     *   transformations
     * @param {Element} root Optional. An HTML element to which append the
     *    string. Defaults, a new _span_ element
     *
     * @return {Element} The root element.
     */
    DOM.sprintf = function(string, args, root) {

        var text, span, idx_start, idx_finish, idx_replace, idxs;
        var spans, key, i;

        root = root || document.createElement('span');
        spans = {};

        // Create an args object, if none is provided.
        // Defaults %em and %strong are added.
        args = args || {};
        args['%strong'] = '';
        args['%em'] = '';

        // Transform arguments before inserting them.
        for (key in args) {
            if (args.hasOwnProperty(key)) {

                switch(key.charAt(0)) {

                case '%': // Span/Strong/Emph .

                    idx_start = string.indexOf(key);

                    // Pattern not found. No error.
                    if (idx_start === -1) continue;

                    idx_replace = idx_start + key.length;
                    idx_finish = string.indexOf(key, idx_replace);

                    if (idx_finish === -1) {
                        JSUS.log('Error. Could not find closing key: ' + key);
                        continue;
                    }

                    // Can be strong, emph or a generic span.
                    spans[idx_start] = key;

                    break;

                case '@': // Replace and sanitize.
                    string = string.replace(key, escape(args[key]));
                    break;

                case '!': // Replace and not sanitize.
                    string = string.replace(key, args[key]);
                    break;

                default:
                    JSUS.log('Identifier not in [!,@,%]: ' + key[0]);

                }
            }
        }

        // No span to create, return what we have.
        if (!JSUS.size(spans)) {
            return root.appendChild(document.createTextNode(string));
        }

        // Re-assamble the string.

        idxs = JSUS.keys(spans).sort(function(a, b){ return a - b; });
        idx_finish = 0;
        for (i = 0; i < idxs.length; i++) {

            // Add span.
            key = spans[idxs[i]];
            idx_start = string.indexOf(key);

            // Add fragments of string.
            if (idx_finish !== idx_start-1) {
                root.appendChild(document.createTextNode(
                    string.substring(idx_finish, idx_start)));
            }

            idx_replace = idx_start + key.length;
            idx_finish = string.indexOf(key, idx_replace);

            if (key === '%strong') {
                span = document.createElement('strong');
            }
            else if (key === '%em') {
                span = document.createElement('em');
            }
            else {
                span = DOM.get('span', args[key]);
            }

            text = string.substring(idx_replace, idx_finish);

            span.appendChild(document.createTextNode(text));

            root.appendChild(span);
            idx_finish = idx_finish + key.length;
        }

        // Add the final part of the string.
        if (idx_finish !== string.length) {
            root.appendChild(document.createTextNode(
                string.substring(idx_finish)));
        }

        return root;
    };

    // ## ELEMENTS

    /**
     * ### DOM.isNode
     *
     * Returns TRUE if the object is a DOM node
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM node
     */
    DOM.isNode = function(o) {
        if (!o || 'object' !== typeof o) return false;
        return 'object' === typeof Node ? o instanceof Node :
            'number' === typeof o.nodeType &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.isElement
     *
     * Returns TRUE if the object is a DOM element
     *
     * Notice: instanceof HTMLElement is not reliable in Safari, even if
     * the method is defined.
     *
     * @param {mixed} The variable to check
     *
     * @return {boolean} TRUE, if the the object is a DOM element
     */
    DOM.isElement = function(o) {
        return o && 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.shuffleElements
     *
     * Shuffles the order of children of a parent Element
     *
     * All children *must* have the id attribute (live list elements cannot
     * be identified by position).
     *
     * Notice the difference between Elements and Nodes:
     *
     * http://stackoverflow.com/questions/7935689/
     * what-is-the-difference-between-children-and-childnodes-in-javascript
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     * @param {function} cb Optional. A callback to execute one each shuffled
     *   element (after re-positioning). This is always the last parameter,
     *   so if order is omitted, it goes second. The callback takes as input:
     *     - the element
     *     - the new order
     *     - the old order
     *
     *
     * @return {array} The order used to shuffle the nodes
     */
    DOM.shuffleElements = function(parent, order, cb) {
        var i, len, numOrder, idOrder, children, child;
        var id;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleElements: parent must be a node. ' +
                               'Found: ' + parent);
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleElements: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if ('undefined' === typeof cb && 'function' === typeof order) {
                cb = order;
            }
            else {
                if (!JSUS.isArray(order)) {
                    throw new TypeError('DOM.shuffleElements: order must be ' +
                                        'array. Found: ' + order);
                }
                if (order.length !== parent.children.length) {
                    throw new Error('DOM.shuffleElements: order length must ' +
                                    'match the number of children nodes.');
                }
            }
        }
        if (cb && 'function' !== typeof cb) {
            throw new TypeError('DOM.shuffleElements: order must be ' +
                                'array. Found: ' + order);
        }

        // DOM4 compliant browsers.
        children = parent.children;

        //https://developer.mozilla.org/en/DOM/Element.children
        //[IE lt 9] IE < 9
        if ('undefined' === typeof children) {
            child = this.firstChild;
            while (child) {
                if (child.nodeType == 1) children.push(child);
                child = child.nextSibling;
            }
        }

        // Get all ids.
        len = children.length;
        idOrder = new Array(len);
        if (cb) numOrder = new Array(len);
        if (!order) order = JSUS.sample(0, (len-1));
        for (i = 0 ; i < len; i++) {
            id = children[order[i]].id;
            if ('string' !== typeof id || id === "") {
                throw new Error('DOM.shuffleElements: no id found on ' +
                                'child n. ' + order[i]);
            }
            idOrder[i] = id;
            if (cb) numOrder[i] = order[i];
        }

        // Two fors are necessary to follow the real sequence (Live List).
        // However, parent.children is a special object, so the sequence
        // could be unreliable.
        for (i = 0 ; i < len; i++) {
            parent.appendChild(children[idOrder[i]]);
            if (cb) cb(children[idOrder[i]], i, numOrder[i]);
        }
        return idOrder;
    };

    /**
     * ### DOM.populateSelect
     *
     * Appends a list of options into a HTML select element
     *
     * @param {HTMLElement} select HTML select element
     * @param {object} options Optional. List of options to add to
     *   the select element. List is in the format of key-values pairs
     *   as innerHTML and value attributes of the option.
     *
     * @return {HTMLElement} select The updated select element
     */
    DOM.populateSelect = function(select, options) {
        var key, opt;
        if (!DOM.isElement(select)) {
            throw new TypeError('DOM.populateSelect: select must be ' +
                                'HTMLElement. Found: ' + select);
        }
        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('DOM.populateSelect: options must be ' +
                                    'object or undefined. Found: ' + options);
            }
            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    opt = document.createElement('option');
                    opt.value = key;
                    opt.innerHTML = options[key];
                    select.appendChild(opt);
                }
            }
        }
        return select;
    };

    /**
     * ### DOM.removeChildrenFromNode
     *
     * Removes all children from a node
     *
     * @param {HTMLNode} node HTML node.
     */
    DOM.removeChildrenFromNode = function(node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
    };

    /**
     * ### DOM.insertAfter
     *
     * Inserts a node element after another one
     *
     * @param {Node} node The node element to insert
     * @param {Node} referenceNode The node element after which the
     *   the insertion is performed
     *
     * @return {Node} The inserted node
     */
    DOM.insertAfter = function(node, referenceNode) {
        return referenceNode.insertBefore(node, referenceNode.nextSibling);
    };

    // ## CSS / JS

    /**
     * ### DOM.addCSS
     *
     * Adds a CSS link to the page
     *
     * @param {string} cssPath The path to the css
     * @param {HTMLElement} root Optional. The root element. If no root
     *    element is passed, it tries document.head, document.body, and
     *    document. If it fails, it throws an error.
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element
     *
     * @return {HTMLElement} The link element
     */
    DOM.addCSS = function(cssPath, root, attributes) {
        if ('string' !== typeof cssPath || cssPath.trim() === '') {
            throw new TypeError('DOM.addCSS: cssPath must be a non-empty ' +
                                'string. Found: ' + cssPath);
        }
        root = root || document.head || document.body || document;
        if (!root) {
            throw new Error('DOM.addCSS: root is undefined, and could not ' +
                            'detect a valid root for css: ' + cssPath);
        }
        attributes = JSUS.mixin({
            rel : 'stylesheet',
            type: 'text/css',
            href: cssPath
        }, attributes);
        return this.add('link', root, attributes);
    };

    /**
     * ### DOM.addJS
     *
     * Adds a JavaScript script to the page
     *
     * @param {string} cssPath The path to the css
     * @param {HTMLElement} root Optional. The root element. If no root
     *    element is passed, it tries document.head, document.body, and
     *    document. If it fails, it throws an error.
     * @param {object|string} attributes Optional. Object containing
     *   attributes for the element. If string, the id of the element
     *
     * @return {HTMLElement} The link element
     *
     */
    DOM.addJS = function(jsPath, root, attributes) {
        if ('string' !== typeof jsPath || jsPath.trim() === '') {
            throw new TypeError('DOM.addCSS: jsPath must be a non-empty ' +
                                'string. Found: ' + jsPath);
        }
        root = root || document.head || document.body || document;
        if (!root) {
            throw new Error('DOM.addCSS: root is undefined, and could not ' +
                            'detect a valid root for css: ' + jsPath);
        }
        attributes = JSUS.mixin({
            charset : 'utf-8',
            type: 'text/javascript',
            src: jsPath
        }, attributes);
        return this.add('script', root, attributes);
    };

    // ## STYLE

    /**
     * ### DOM.highlight
     *
     * Highlights an element by adding a custom border around it
     *
     * Three pre-defined modes are implemented:
     *
     * - OK: green
     * - WARN: yellow
     * - ERR: red (default)
     *
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     *
     * ```javascript
     * highlight(myDiv, 'WARN');  // yellow border
     * highlight(myDiv);          // red border
     * highlight(myDiv, '#CCC');  // grey border
     * ```
     *
     * @param {HTMLElement} elem The element to highlight
     * @param {string} code The type of highlight
     *
     * @return {HTMLElement} elem The styled element
     *
     * @see DOM.addBorder
     * @see DOM.style
     */
    DOM.highlight = function(elem, code) {
        var color;
        // Default value is ERR.
        switch (code) {
        case 'OK':
            color =  'green';
            break;
        case 'WARN':
            color = 'yellow';
            break;
        case 'ERR':
            color = 'red';
            break;
        default:
            if (code.charAt(0) === '#') color = code;
            else color = 'red';
        }
        return this.addBorder(elem, color);
    };

    /**
     * ### DOM.addBorder
     *
     * Adds a border around the specified element
     *
     * @param {HTMLElement} elem The element to which adding the borders
     * @param {string} color Optional. The color of border. Default: 'red'.
     * @param {string} width Optional. The width of border. Default: '5px'.
     * @param {string} type Optional. The type of border. Default: 'solid'.
     *
     * @return {HTMLElement} The element to which a border has been added
     */
    DOM.addBorder = function(elem, color, width, type) {
        var properties;
        color = color || 'red';
        width = width || '5px';
        type = type || 'solid';
        properties = { border: width + ' ' + type + ' ' + color };
        return DOM.style(elem, properties);
    };

    /**
     * ### DOM.style
     *
     * Styles an element as an in-line css.
     *
     * Existing style properties are maintained, and new ones added.
     *
     * @param {HTMLElement} elem The element to style
     * @param {object} Objects containing the properties to add.
     *
     * @return {HTMLElement} The styled element
     */
    DOM.style = function(elem, properties) {
        var i;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.style: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (properties) {
            if ('object' !== typeof properties) {
                throw new TypeError('DOM.style: properties must be object or ' +
                                    'undefined. Found: ' + properties);
            }
            for (i in properties) {
                if (properties.hasOwnProperty(i)) {
                    elem.style[i] = properties[i];
                }
            }
        }
        return elem;
    };

    // ## ID

    /**
     * ### DOM.generateUniqueId
     *
     * Generates a unique id for the whole page, frames included
     *
     * The resulting id is of the type: prefix_randomdigits.
     *
     * @param {string} prefix Optional. A given prefix. Default: a random
     *   string of 8 characters.
     * @param {boolean} checkFrames Optional. If TRUE, the id will be unique
     *   all frames as well. Default: TRUE
     *
     * @return {string} id The unique id
     */
    DOM.generateUniqueId = (function() {
        var limit;
        limit = 100;

        // Returns TRUE if id is NOT found in all docs (optimized).
        function scanDocuments(docs, id) {
            var i, len;
            len = docs.length;
            if (len === 1) {
                return !docs[0].document.getElementById(id);
            }
            if (len === 2) {
                return !!(docs[0].document.getElementById(id) &&
                          docs[1].document.getElementById(id));
            }
            i = -1;
            for ( ; ++i < len ; ) {
                if (docs[i].document.getElementById(id)) return false;
            }
            return true;
        }

        return function(prefix, checkFrames) {
            var id, windows;
            var found, counter;

            if (prefix) {
                if ('string' !== typeof prefix && 'number' !== typeof prefix) {
                    throw new TypeError('DOM.generateUniqueId: prefix must ' +
                                        'be string or number. Found: ' +
                                        prefix);
                }
            }
            else {
                prefix = JSUS.randomString(8, 'a');
            }
            id = prefix + '_';

            windows = [ window ];
            if ((checkFrames || 'undefined' === typeof checkFrames) &&
                window.frames) {

                windows = windows.concat(window.frames);
            }

            found = true;
            counter = -1;
            while (found) {
                id = prefix + '_' + JSUS.randomInt(1000);
                found = scanDocuments(windows, id);
                if (++counter > limit) {
                    throw new Error('DOM.generateUniqueId: could not ' +
                                    'find unique id within ' + limit +
                                    ' trials.');
                }
            }
            return id;
        };
    })();

    // ## CLASSES

    /**
     * ### DOM.removeClass
     *
     * Removes a specific class from the classNamex attribute of a given element
     *
     * @param {HTMLElement} el An HTML element
     * @param {string} className The name of a CSS class already in the element
     *
     * @return {HTMLElement|undefined} The HTML element with the removed
     *   class, or undefined if the inputs are misspecified
     */
    DOM.removeClass = function(elem, className) {
        var regexpr, o;
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.removeClass: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (className) {
            if ('string' !== typeof className || className.trim() === '') {
                throw new TypeError('DOM.removeClass: className must be ' +
                                    'HTMLElement. Found: ' + className);
            }
            regexpr = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
            o = elem.className = elem.className.replace(regexpr, '' );
        }
        return elem;
    };

    /**
     * ### DOM.addClass
     *
     * Adds one or more classes to the className attribute of the given element
     *
     * Takes care not to overwrite already existing classes.
     *
     * @param {HTMLElement} elem An HTML element
     * @param {string|array} className The name/s of CSS class/es
     *
     * @return {HTMLElement} The HTML element with the additional
     *   class, or undefined if the inputs are misspecified
     */
    DOM.addClass = function(elem, className) {
        if (!DOM.isElement(elem)) {
            throw new TypeError('DOM.addClass: elem must be HTMLElement. ' +
                                'Found: ' + elem);
        }
        if (className) {
            if (className instanceof Array) className = className.join(' ');
            if ('string' !== typeof className || className.trim() === '') {
                throw new TypeError('DOM.addClass: className must be ' +
                                    'HTMLElement. Found: ' + className);
            }
            if (!elem.className) elem.className = className;
            else elem.className += (' ' + className);
        }
        return elem;
    };

    /**
     * ### DOM.getElementsByClassName
     *
     * Returns an array of elements with requested class name
     *
     * @param {object} document The document object of a window or iframe
     * @param {string} className The requested className
     * @param {string}  nodeName Optional. If set only elements with
     *   the specified tag name will be searched
     *
     * @return {array} Array of elements with the requested class name
     *
     * @see https://gist.github.com/E01T/6088383
     * @see http://stackoverflow.com/
     *      questions/8808921/selecting-a-css-class-with-xpath
     */
    DOM.getElementsByClassName = function(document, className, nodeName) {
        var result, node, tag, seek, i, rightClass;
        result = [];
        tag = nodeName || '*';
        if (document.evaluate) {
            seek = '//' + tag +
                '[contains(concat(" ", normalize-space(@class), " "), "' +
                className + ' ")]';
            seek = document.evaluate(seek, document, null, 0, null );
            while ((node = seek.iterateNext())) {
                result.push(node);
            }
        }
        else {
            rightClass = new RegExp( '(^| )'+ className +'( |$)' );
            seek = document.getElementsByTagName(tag);
            for (i = 0; i < seek.length; i++)
                if (rightClass.test((node = seek[i]).className )) {
                    result.push(seek[i]);
                }
        }
        return result;
    };

    // ## IFRAME

    /**
     * ### DOM.getIFrameDocument
     *
     * Returns a reference to the document of an iframe object
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLDocument|null} The document of the iframe, or
     *   null if not found.
     */
    DOM.getIFrameDocument = function(iframe) {
        if (!iframe) return null;
        return iframe.contentDocument ||
            iframe.contentWindow ? iframe.contentWindow.document : null;
    };

    /**
     * ### DOM.getIFrameAnyChild
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     *
     * @return {HTMLElement|undefined} The child, or undefined if none is found
     */
    DOM.getIFrameAnyChild = function(iframe) {
        var contentDocument;
        if (!iframe) return;
        contentDocument = DOM.getIFrameDocument(iframe);
        return contentDocument.head || contentDocument.body ||
            contentDocument.lastChild ||
            contentDocument.getElementsByTagName('html')[0];
    };

    // ## EVENTS

    /**
     * ### DOM.addEvent
     *
     * Adds an event listener to an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to handle
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event will initiate a capture.
     *   Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.removeEvent
     *
     * Kudos:
     * http://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
     */
    DOM.addEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.attachEvent) return element.attachEvent('on' + event, func);
        else return element.addEventListener(event, func, capture);
    };

    /**
     * ### DOM.removeEvent
     *
     * Removes an event listener from an element (cross-browser)
     *
     * @param {Element} element A target element
     * @param {string} event The name of the event to remove
     * @param {function} func The event listener
     * @param {boolean} Optional. If TRUE, the event was registered
     *   as a capture. Available only in some browsers. Default, FALSE
     *
     * @return {boolean} TRUE, on success. However, the return value is
     *   browser dependent.
     *
     * @see DOM.addEvent
     */
    DOM.removeEvent = function(element, event, func, capture) {
        capture = !!capture;
        if (element.detachEvent) return element.detachEvent('on' + event, func);
        else return element.removeEventListener(event, func, capture);
    };

    /**
     * ### DOM.onFocusIn
     *
     * Registers a callback to be executed when the page acquires focus
     *
     * @param {function|null} cb Callback executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusIn = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusIn: cb must be function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }

        onFocusChange(cb);
    };

    /**
     * ### DOM.onFocusOut
     *
     * Registers a callback to be executed when the page loses focus
     *
     * @param {function} cb Callback executed if page loses focus,
     *   or NULL, to delete an existing callback.
     * @param {object|function} ctx Optional. Context of execution for cb
     *
     * @see onFocusChange
     */
    DOM.onFocusOut = function(cb, ctx) {
        var origCb;
        if ('function' !== typeof cb && null !== cb) {
            throw new TypeError('JSUS.onFocusOut: cb must be ' +
                                'function or null.');
        }
        if (ctx) {
            if ('object' !== typeof ctx && 'function' !== typeof ctx) {
                throw new TypeError('JSUS.onFocusIn: ctx must be object, ' +
                                    'function or undefined.');
            }
            origCb = cb;
            cb = function() { origCb.call(ctx); };
        }
        onFocusChange(undefined, cb);
    };

    // ## UI

    /**
     * ### DOM.disableRightClick
     *
     * Disables the popup of the context menu by right clicking with the mouse
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.enableRightClick
     */
    DOM.disableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.captureEvents(Event.MOUSEDOWN);
            doc.onmousedown = function clickNS4(e) {
                if (doc.layers || doc.getElementById && !doc.all) {
                    if (e.which == 2 || e.which == 3) {
                        return false;
                    }
                }
            };
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = function clickIE4() {
                if (event.button == 2) {
                    return false;
                }
            };
        }
        doc.oncontextmenu = function() { return false; };
    };

    /**
     * ### DOM.enableRightClick
     *
     * Enables the popup of the context menu by right clicking with the mouse
     *
     * It unregisters the event handlers created by `DOM.disableRightClick`
     *
     * @param {Document} Optional. A target document object. Defaults, document
     *
     * @see DOM.disableRightClick
     */
    DOM.enableRightClick = function(doc) {
        doc = doc || document;
        if (doc.layers) {
            doc.releaseEvents(Event.MOUSEDOWN);
            doc.onmousedown = null;
        }
        else if (doc.all && !doc.getElementById) {
            doc.onmousedown = null;
        }
        doc.oncontextmenu = null;
    };

    /**
     * ### DOM.disableBackButton
     *
     * Disables/re-enables backward navigation in history of browsed pages
     *
     * When disabling, it inserts twice the current url.
     *
     * It will still be possible to manually select the uri in the
     * history pane and nagivate to it.
     *
     * @param {boolean} disable Optional. If TRUE disables back button,
     *   if FALSE, re-enables it. Default: TRUE.
     *
     * @return {boolean} The state of the back button (TRUE = disabled),
     *   or NULL if the method is not supported by browser.
     */
    DOM.disableBackButton = (function(isDisabled) {
        return function(disable) {
            disable = 'undefined' === typeof disable ? true : disable;
            if (disable && !isDisabled) {
                if (!history.pushState || !history.go) {
                    JSUS.log('DOM.disableBackButton: method not ' +
                             'supported by browser.');
                    return null;
                }
                history.pushState(null, null, location.href);
                window.onpopstate = function(event) {
                    history.go(1);
                };
            }
            else if (isDisabled) {
                window.onpopstate = null;
            }
            isDisabled = disable;
            return disable;
        };
    })(false);

    // ## EXTRA

    /**
     * ### DOM.playSound
     *
     * Plays a sound
     *
     * @param {various} sound Audio tag or path to audio file to be played
     */
    DOM.playSound = 'undefined' === typeof Audio ?
        function() {
            console.log('JSUS.playSound: Audio tag not supported in your' +
                    ' browser. Cannot play sound.');
        } :
        function(sound) {
        var audio;
        if ('string' === typeof sound) {
            audio = new Audio(sound);
        }
        else if ('object' === typeof sound &&
            'function' === typeof sound.play) {
            audio = sound;
        }
        else {
            throw new TypeError('JSUS.playSound: sound must be string' +
               ' or audio element.');
        }
        audio.play();
    };

    /**
     * ### DOM.blinkTitle
     *
     * Changes the title of the page in regular intervals
     *
     * Calling the function without any arguments stops the blinking
     * If an array of strings is provided, that array will be cycled through.
     * If a signle string is provided, the title will alternate between '!!!'
     *   and that string.
     *
     * @param {mixed} titles New title to blink
     * @param {object} options Optional. Configuration object.
     *   Accepted values and default in parenthesis:
     *
     *     - stopOnFocus (false): Stop blinking if user switched to tab
     *     - stopOnClick (false): Stop blinking if user clicks on the
     *         specified element
     *     - finalTitle (document.title): Title to set after blinking is done
     *     - repeatFor (undefined): Show each element in titles at most
     *         N times -- might be stopped earlier by other events.
     *     - startOnBlur(false): Start blinking if user switches
     *          away from tab
     *     - period (1000) How much time between two blinking texts in the title
     *
     * @return {function|null} A function to clear the blinking of texts,
     *    or NULL, if the interval was not created yet (e.g. with startOnBlur
     *    option), or just destroyed.
     */
    DOM.blinkTitle = (function(id) {
        var clearBlinkInterval, finalTitle, elem;
        clearBlinkInterval = function(opts) {
            clearInterval(id);
            id = null;
            if (elem) {
                elem.removeEventListener('click', clearBlinkInterval);
                elem = null;
            }
            if (finalTitle) {
                document.title = finalTitle;
                finalTitle = null;
            }
        };
        return function(titles, options) {
            var period, where, rotation;
            var rotationId, nRepeats;

            if (null !== id) clearBlinkInterval();
            if ('undefined' === typeof titles) return null;

            where = 'JSUS.blinkTitle: ';
            options = options || {};

            // Option finalTitle.
            if ('undefined' === typeof options.finalTitle) {
                finalTitle = document.title;
            }
            else if ('string' === typeof options.finalTitle) {
                finalTitle = options.finalTitle;
            }
            else {
                throw new TypeError(where + 'options.finalTitle must be ' +
                                    'string or undefined. Found: ' +
                                    options.finalTitle);
            }

            // Option repeatFor.
            if ('undefined' !== typeof options.repeatFor) {
                nRepeats = JSUS.isInt(options.repeatFor, 0);
                if (false === nRepeats) {
                    throw new TypeError(where + 'options.repeatFor must be ' +
                                        'a positive integer. Found: ' +
                                        options.repeatFor);
                }
            }

            // Option stopOnFocus.
            if (options.stopOnFocus) {
                JSUS.onFocusIn(function() {
                    clearBlinkInterval();
                    onFocusChange(null, null);
                });
            }

            // Option stopOnClick.
            if ('undefined' !== typeof options.stopOnClick) {
                if ('object' !== typeof options.stopOnClick ||
                    !options.stopOnClick.addEventListener) {

                    throw new TypeError(where + 'options.stopOnClick must be ' +
                                        'an HTML element with method ' +
                                        'addEventListener. Found: ' +
                                        options.stopOnClick);
                }
                elem = options.stopOnClick;
                elem.addEventListener('click', clearBlinkInterval);
            }

            // Option startOnBlur.
            if (options.startOnBlur) {
                options.startOnBlur = null;
                JSUS.onFocusOut(function() {
                    JSUS.blinkTitle(titles, options);
                });
                return null;
            }

            // Prepare the rotation.
            if ('string' === typeof titles) {
                titles = [titles, '!!!'];
            }
            else if (!JSUS.isArray(titles)) {
                throw new TypeError(where + 'titles must be string, ' +
                                    'array of strings or undefined. Found: ' +
                                    titles);
            }
            rotationId = 0;
            period = options.period || 1000;
            // Function to be executed every period.
            rotation = function() {
                changeTitle(titles[rotationId]);
                rotationId = (rotationId+1) % titles.length;
                // Control the number of times it should be cycled through.
                if ('number' === typeof nRepeats) {
                    if (rotationId === 0) {
                        nRepeats--;
                        if (nRepeats === 0) clearBlinkInterval();
                    }
                }
            };
            // Perform first rotation right now.
            rotation();
            id = setInterval(rotation, period);

            // Return clear function.
            return clearBlinkInterval;
        };
    })(null);

    /**
     * ### DOM.cookieSupport
     *
     * Tests for cookie support
     *
     * @return {boolean|null} The type of support for cookies. Values:
     *
     *   - null: no cookies
     *   - false: only session cookies
     *   - true: session cookies and persistent cookies (although
     *       the browser might clear them on exit)
     *
     * Kudos: http://stackoverflow.com/questions/2167310/
     *        how-to-show-a-message-only-if-cookies-are-disabled-in-browser
     */
    DOM.cookieSupport = function() {
        var c, persist;
        persist = true;
        do {
            c = 'gCStest=' + Math.floor(Math.random()*100000000);
            document.cookie = persist ? c +
                ';expires=Tue, 01-Jan-2030 00:00:00 GMT' : c;

            if (document.cookie.indexOf(c) !== -1) {
                document.cookie= c + ';expires=Sat, 01-Jan-2000 00:00:00 GMT';
                return persist;
            }
        } while (!(persist = !persist));

        return null;
    };

    /**
     * ### DOM.viewportSize
     *
     * Returns the current size of the viewport in pixels
     *
     * The viewport's size is the actual visible part of the browser's
     * window. This excludes, for example, the area occupied by the
     * JavaScript console.
     *
     * @param {string} dim Optional. Controls the return value ('x', or 'y')
     *
     * @return {object|number} An object containing x and y property, or
     *   number specifying the value for x or y
     *
     * Kudos: http://stackoverflow.com/questions/3437786/
     *        get-the-size-of-the-screen-current-web-page-and-browser-window
     */
    DOM.viewportSize = function(dim) {
        var w, d, e, g, x, y;
        if (dim && dim !== 'x' && dim !== 'y') {
            throw new TypeError('DOM.viewportSize: dim must be "x","y" or ' +
                                'undefined. Found: ' + dim);
        }
        w = window;
        d = document;
        e = d.documentElement;
        g = d.getElementsByTagName('body')[0];
        x = w.innerWidth || e.clientWidth || g.clientWidth;
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        return !dim ? { x: x, y: y } : dim === 'x' ? x : y;
    };

    // ## Helper methods

    /**
     * ### onFocusChange
     *
     * Helper function for DOM.onFocusIn and DOM.onFocusOut (cross-browser)
     *
     * Expects only one callback, either inCb, or outCb.
     *
     * @param {function|null} inCb Optional. Executed if page acquires focus,
     *   or NULL, to delete an existing callback.
     * @param {function|null} outCb Optional. Executed if page loses focus,
     *   or NULL, to delete an existing callback.
     *
     * Kudos: http://stackoverflow.com/questions/1060008/
     *   is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
     *
     * @see http://www.w3.org/TR/page-visibility/
     */
    onFocusChange = (function(document) {
        var inFocusCb, outFocusCb, event, hidden, evtMap;

        if (!document) {
            return function() {
                JSUS.log('onFocusChange: no document detected.');
                return;
            };
        }

        if ('hidden' in document) {
            hidden = 'hidden';
            event = 'visibilitychange';
        }
        else if ('mozHidden' in document) {
            hidden = 'mozHidden';
            event = 'mozvisibilitychange';
        }
        else if ('webkitHidden' in document) {
            hidden = 'webkitHidden';
            event = 'webkitvisibilitychange';
        }
        else if ('msHidden' in document) {
            hidden = 'msHidden';
            event = 'msvisibilitychange';
        }

        evtMap = {
            focus: true, focusin: true, pageshow: true,
            blur: false, focusout: false, pagehide: false
        };

        function onchange(evt) {
            var isHidden;
            evt = evt || window.event;
            // If event is defined as one from event Map.
            if (evt.type in evtMap) isHidden = evtMap[evt.type];
            // Or use the hidden property.
            else isHidden = this[hidden] ? true : false;
            // Call the callback, if defined.
            if (!isHidden) { if (inFocusCb) inFocusCb(); }
            else { if (outFocusCb) outFocusCb(); }
        }

        return function(inCb, outCb) {
            var onchangeCb;

            if ('undefined' !== typeof inCb) inFocusCb = inCb;
            else outFocusCb = outCb;

            onchangeCb = !inFocusCb && !outFocusCb ? null : onchange;

            // Visibility standard detected.
            if (event) {
                if (onchangeCb) document.addEventListener(event, onchange);
                else document.removeEventListener(event, onchange);
            }
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchangeCb;
            }
            // All others.
            else {
                window.onpageshow = window.onpagehide =
                    window.onfocus = window.onblur = onchangeCb;
            }
        };
    })('undefined' !== typeof document ? document : null);

    /**
     * ### changeTitle
     *
     * Changes title of page
     *
     * @param {string} title New title of the page
     */
    changeTitle = function(title) {
        if ('string' === typeof title) {
            document.title = title;
        }
        else {
            throw new TypeError('JSUS.changeTitle: title must be string. ' +
                                'Found: ' + title);
        }
    };

    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
