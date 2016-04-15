/**
 * # DOM
 *
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to DOM manipulation
 *
 * Helper library to perform generic operation with DOM elements.
 *
 * The general syntax is the following: Every HTML element has associated
 * a get* and a add* method, whose syntax is very similar.
 *
 * - The get* method creates the element and returns it.
 * - The add* method creates the element, append it as child to a root element,
 *     and then returns it.
 *
 * The syntax of both method is the same, but the add* method
 * needs the root element as first parameter. E.g.
 *
 * - getButton(id, text, attributes);
 * - addButton(root, id, text, attributes);
 *
 * The last parameter is generally an object containing a list of
 * of key-values pairs as additional attributes to set to the element.
 *
 * Only the methods which do not follow the above-mentioned syntax
 * will receive further explanation.
 */
(function(JSUS) {

    "use strict";

    var onFocusChange, changeTitle;

    function DOM() {}

    // ## GENERAL

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into a root element
     *
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
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
     * @param {Element} root The HTML element where to write into
     * @param {mixed} text The text to write. Default, an ampty string
     * @param {string} rc the name of the tag to use as a break element
     *
     * @return {TextNode} The text node inserted in the root element
     *
     * @see DOM.write
     * @see DOM.addBreak
     */
    DOM.writeln = function(root, text, rc) {
        var content;
        content = DOM.write(root, text);
        this.addBreak(root, rc);
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
                span = JSUS.getElement('span', null, args[key]);
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
        if ('object' !== typeof o) return false;
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
        return 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ### DOM.shuffleElements
     *
     * Shuffles the children element nodes
     *
     * All children must have the id attribute.
     *
     * Notice the difference between Elements and Nodes:
     *
     * http://stackoverflow.com/questions/7935689/
     * what-is-the-difference-between-children-and-childnodes-in-javascript
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     *
     * @return {array} The order used to shuffle the nodes
     */
    DOM.shuffleElements = function(parent, order) {
        var i, len, idOrder, children, child;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleNodes: parent must node.');
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleNodes: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if (!JSUS.isArray(order)) {
                throw new TypeError('DOM.shuffleNodes: order must array.');
            }
            if (order.length !== parent.children.length) {
                throw new Error('DOM.shuffleNodes: order length must match ' +
                                'the number of children nodes.');
            }
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

        len = children.length;
        idOrder = [];
        if (!order) order = JSUS.sample(0, (len-1));
        for (i = 0 ; i < len; i++) {
            idOrder.push(children[order[i]].id);
        }
        // Two fors are necessary to follow the real sequence.
        // However parent.children is a special object, so the sequence
        // could be unreliable.
        for (i = 0 ; i < len; i++) {
            parent.appendChild(children[idOrder[i]]);
        }

        return idOrder;
    };

    /**
     * ### DOM.shuffleNodes
     *
     * It actually shuffles Elements.
     *
     * @deprecated
     */
    DOM.shuffleNodes = DOM.shuffleElements;

    /**
     * ### DOM.getElement
     *
     * Creates a generic HTML element with id and attributes as specified
     *
     * @param {string} elem The name of the tag
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.addAttributes2Elem
     */
    DOM.getElement = function(elem, id, attributes) {
        var e = document.createElement(elem);
        if ('undefined' !== typeof id) {
            e.id = id;
        }
        return this.addAttributes2Elem(e, attributes);
    };

    /**
     * ### DOM.addElement
     *
     * Creates and appends a generic HTML element with specified attributes
     *
     * @param {string} elem The name of the tag
     * @param {HTMLElement} root The root element to which the new element will
     *   be appended
     * @param {string} id Optional. The id of the tag
     * @param {object} attributes Optional. Object containing attributes for
     *   the newly created element
     *
     * @return {HTMLElement} The newly created HTML element
     *
     * @see DOM.getElement
     * @see DOM.addAttributes2Elem
     */
    DOM.addElement = function(elem, root, id, attributes) {
        var el = this.getElement(elem, id, attributes);
        return root.appendChild(el);
    };

    /**
     * ### DOM.addAttributes2Elem
     *
     * Adds attributes to an HTML element and returns it.
     *
     * Attributes are defined as key-values pairs.
     * Attributes 'label' is ignored, attribute 'className' ('class') and
     * 'style' are special and are delegated to special methods.
     *
     * @param {HTMLElement} e The element to decorate
     * @param {object} a Object containing attributes to add to the element
     *
     * @return {HTMLElement} The decorated element
     *
     * @see DOM.addLabel
     * @see DOM.addClass
     * @see DOM.style
     */
    DOM.addAttributes2Elem = function(e, a) {
        var key;
        if (!e || !a) return e;
        if ('object' != typeof a) return e;
        for (key in a) {
            if (a.hasOwnProperty(key)) {
                if (key === 'id') {
                    e.id = a[key];
                }
                else if (key === 'class' || key === 'className') {
                    DOM.addClass(e, a[key]);
                }
                else if (key === 'style') {
                    DOM.style(e, a[key]);
                }
                else if (key === 'label') {
                    // Handle the case.
                    JSUS.log('DOM.addAttributes2Elem: label attribute is not ' +
                             'supported. Use DOM.addLabel instead.');
                }
                else {
                    e.setAttribute(key, a[key]);
                }


                // TODO: handle special cases
                // <!--
                //else {
                //
                //    // If there is no parent node,
                //    // the legend cannot be created
                //    if (!e.parentNode) {
                //        node.log('Cannot add label: ' +
                //                 'no parent element found', 'ERR');
                //        continue;
                //    }
                //
                //    this.addLabel(e.parentNode, e, a[key]);
                //}
                // -->
            }
        }
        return e;
    };

    /**
     * ### DOM.populateSelect
     *
     * Appends a list of options into a HTML select element.
     * The second parameter list is an object containing
     * a list of key-values pairs as text-value attributes for
     * the option.
     *
     * @param {HTMLElement} select HTML select element
     * @param {object} list Options to add to the select element
     */
    DOM.populateSelect = function(select, list) {
        var key, opt;
        if (!select || !list) return;
        for (key in list) {
            if (list.hasOwnProperty(key)) {
                opt = document.createElement('option');
                opt.value = list[key];
                opt.appendChild(document.createTextNode(key));
                select.appendChild(opt);
            }
        }
    };

    /**
     * ### DOM.removeChildrenFromNode
     *
     * Removes all children from a node.
     *
     * @param {HTMLElement} e HTML element.
     */
    DOM.removeChildrenFromNode = function(e) {
        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
    };

    /**
     * ### DOM.insertAfter
     *
     * Insert a node element after another one.
     *
     * The first parameter is the node to add.
     *
     */
    DOM.insertAfter = function(node, referenceNode) {
        referenceNode.insertBefore(node, referenceNode.nextSibling);
    };

    /**
     * ### DOM.generateUniqueId
     *
     * Generate a unique id for the page (frames included).
     *
     * TODO: now it always create big random strings, it does not actually
     * check if the string exists.
     *
     */
    DOM.generateUniqueId = function(prefix) {
        var search = [window];
        if (window.frames) {
            search = search.concat(window.frames);
        }

        function scanDocuments(id) {
            var found = true;
            while (found) {
                for (var i=0; i < search.length; i++) {
                    found = search[i].document.getElementById(id);
                    if (found) {
                        id = '' + id + '_' + JSUS.randomInt(0, 1000);
                        break;
                    }
                }
            }
            return id;
        }


        return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
        //return scanDocuments(prefix);
    };

    // ## GET/ADD

    /**
     * ### DOM.getButton
     *
     */
    DOM.getButton = function(id, text, attributes) {
        var sb;
        sb = document.createElement('button');
        if ('undefined' !== typeof id) sb.id = id;
        sb.appendChild(document.createTextNode(text || 'Send'));
        return this.addAttributes2Elem(sb, attributes);
    };

    /**
     * ### DOM.addButton
     *
     */
    DOM.addButton = function(root, id, text, attributes) {
        var b = this.getButton(id, text, attributes);
        return root.appendChild(b);
    };

    /**
     * ### DOM.getFieldset
     *
     */
    DOM.getFieldset = function(id, legend, attributes) {
        var f = this.getElement('fieldset', id, attributes);
        var l = document.createElement('Legend');
        l.appendChild(document.createTextNode(legend));
        f.appendChild(l);
        return f;
    };

    /**
     * ### DOM.addFieldset
     *
     */
    DOM.addFieldset = function(root, id, legend, attributes) {
        var f = this.getFieldset(id, legend, attributes);
        return root.appendChild(f);
    };

    /**
     * ### DOM.getTextInput
     *
     */
    DOM.getTextInput = function(id, attributes) {
        var ti =  document.createElement('input');
        if ('undefined' !== typeof id) ti.id = id;
        ti.setAttribute('type', 'text');
        return this.addAttributes2Elem(ti, attributes);
    };

    /**
     * ### DOM.addTextInput
     *
     */
    DOM.addTextInput = function(root, id, attributes) {
        var ti = this.getTextInput(id, attributes);
        return root.appendChild(ti);
    };

    /**
     * ### DOM.getTextArea
     *
     */
    DOM.getTextArea = function(id, attributes) {
        var ta =  document.createElement('textarea');
        if ('undefined' !== typeof id) ta.id = id;
        return this.addAttributes2Elem(ta, attributes);
    };

    /**
     * ### DOM.addTextArea
     *
     */
    DOM.addTextArea = function(root, id, attributes) {
        var ta = this.getTextArea(id, attributes);
        return root.appendChild(ta);
    };

    /**
     * ### DOM.getCanvas
     *
     */
    DOM.getCanvas = function(id, attributes) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        if (!context) {
            alert('Canvas is not supported');
            return false;
        }

        canvas.id = id;
        return this.addAttributes2Elem(canvas, attributes);
    };

    /**
     * ### DOM.addCanvas
     *
     */
    DOM.addCanvas = function(root, id, attributes) {
        var c = this.getCanvas(id, attributes);
        return root.appendChild(c);
    };

    /**
     * ### DOM.getSlider
     *
     */
    DOM.getSlider = function(id, attributes) {
        var slider = document.createElement('input');
        slider.id = id;
        slider.setAttribute('type', 'range');
        return this.addAttributes2Elem(slider, attributes);
    };

    /**
     * ### DOM.addSlider
     *
     */
    DOM.addSlider = function(root, id, attributes) {
        var s = this.getSlider(id, attributes);
        return root.appendChild(s);
    };

    /**
     * ### DOM.getRadioButton
     *
     */
    DOM.getRadioButton = function(id, attributes) {
        var radio = document.createElement('input');
        radio.id = id;
        radio.setAttribute('type', 'radio');
        return this.addAttributes2Elem(radio, attributes);
    };

    /**
     * ### DOM.addRadioButton
     *
     */
    DOM.addRadioButton = function(root, id, attributes) {
        var rb = this.getRadioButton(id, attributes);
        return root.appendChild(rb);
    };

    /**
     * ### DOM.getLabel
     *
     */
    DOM.getLabel = function(forElem, id, labelText, attributes) {
        if (!forElem) return false;
        var label = document.createElement('label');
        label.id = id;
        label.appendChild(document.createTextNode(labelText));

        if ('undefined' === typeof forElem.id) {
            forElem.id = this.generateUniqueId();
        }

        label.setAttribute('for', forElem.id);
        this.addAttributes2Elem(label, attributes);
        return label;
    };

    /**
     * ### DOM.addLabel
     *
     */
    DOM.addLabel = function(root, forElem, id, labelText, attributes) {
        if (!root || !forElem || !labelText) return false;
        var l = this.getLabel(forElem, id, labelText, attributes);
        root.insertBefore(l, forElem);
        return l;
    };

    /**
     * ### DOM.getSelect
     *
     */
    DOM.getSelect = function(id, attributes) {
        return this.getElement('select', id, attributes);
    };

    /**
     * ### DOM.addSelect
     *
     */
    DOM.addSelect = function(root, id, attributes) {
        return this.addElement('select', root, id, attributes);
    };

    /**
     * ### DOM.getIFrame
     *
     */
    DOM.getIFrame = function(id, attributes) {
        attributes = attributes || {};
        if (!attributes.name) {
            attributes.name = id; // For Firefox
        }
        return this.getElement('iframe', id, attributes);
    };

    /**
     * ### DOM.addIFrame
     *
     */
    DOM.addIFrame = function(root, id, attributes) {
        var ifr = this.getIFrame(id, attributes);
        return root.appendChild(ifr);
    };

    /**
     * ### DOM.addBreak
     *
     */
    DOM.addBreak = function(root, rc) {
        var RC = rc || 'br';
        var br = document.createElement(RC);
        return root.appendChild(br);
        //return this.insertAfter(br,root);
    };

    /**
     * ### DOM.getDiv
     *
     */
    DOM.getDiv = function(id, attributes) {
        return this.getElement('div', id, attributes);
    };

    /**
     * ### DOM.addDiv
     *
     */
    DOM.addDiv = function(root, id, attributes) {
        return this.addElement('div', root, id, attributes);
    };

    // ## CSS / JS

    /**
     * ### DOM.addCSS
     *
     * If no root element is passed, it tries to add the CSS
     * link element to document.head, document.body, and
     * finally document. If it fails, returns FALSE.
     *
     */
    DOM.addCSS = function(root, css, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {rel : 'stylesheet',
                                             type: 'text/css',
                                             href: css
                                            });

        return this.addElement('link', root, id, attributes);
    };

    /**
     * ### DOM.addJS
     *
     */
    DOM.addJS = function(root, js, id, attributes) {
        root = root || document.head || document.body || document;
        if (!root) return false;

        attributes = attributes || {};

        attributes = JSUS.merge(attributes, {charset : 'utf-8',
                                             type: 'text/javascript',
                                             src: js
                                            });

        return this.addElement('script', root, id, attributes);
    };

    /**
     * ### DOM.highlight
     *
     * Provides a simple way to highlight an HTML element
     * by adding a colored border around it.
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
     * highlight(myDiv, 'WARN'); // yellow border
     * highlight(myDiv);          // red border
     * highlight(myDiv, '#CCC'); // grey border
     * ```
     *
     * @see DOM.addBorder
     * @see DOM.style
     */
     DOM.highlight = function(elem, code) {
        var color;
        if (!elem) return;

        // default value is ERR
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
            if (code.charAt(0) === '#') {
                color = code;
            }
            else {
                color = 'red';
            }
        }

        return this.addBorder(elem, color);
    };

    /**
     * ### DOM.addBorder
     *
     * Adds a border around the specified element. Color,
     * width, and type can be specified.
     */
    DOM.addBorder = function(elem, color, width, type) {
        var properties;
        if (!elem) return;

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
        if (!elem || !properties) return;
        if (!DOM.isElement(elem)) return;

        for (i in properties) {
            if (properties.hasOwnProperty(i)) {
                elem.style[i] = properties[i];
            }
        }
        return elem;
    };

    /**
     * ### DOM.removeClass
     *
     * Removes a specific class from the classNamex attribute of a given element
     *
     * @param {HTMLElement} el An HTML element
     * @param {string} c The name of a CSS class already in the element
     *
     * @return {HTMLElement|undefined} The HTML element with the removed
     *   class, or undefined if the inputs are misspecified
     */
    DOM.removeClass = function(el, c) {
        var regexpr, o;
        if (!el || !c) return;
        regexpr = new RegExp('(?:^|\\s)' + c + '(?!\\S)');
        o = el.className = el.className.replace( regexpr, '' );
        return el;
    };

    /**
     * ### DOM.addClass
     *
     * Adds one or more classes to the className attribute of the given element
     *
     * Takes care not to overwrite already existing classes.
     *
     * @param {HTMLElement} el An HTML element
     * @param {string|array} c The name/s of CSS class/es
     *
     * @return {HTMLElement|undefined} The HTML element with the additional
     *   class, or undefined if the inputs are misspecified
     */
    DOM.addClass = function(el, c) {
        if (!el) return;
        if (c instanceof Array) c = c.join(' ');
        else if ('string' !== typeof c) return;
        el.className = el.className ? el.className + ' ' + c : c;
        return el;
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
        contentDocument = W.getIFrameDocument(iframe);
        return contentDocument.head || contentDocument.body ||
            contentDocument.lastChild ||
            contentDocument.getElementsByTagName('html')[0];
    };

    // ## RIGHT-CLICK

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
        doc.oncontextmenu = new Function("return false");
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
        if ('string' === typeof(sound)) {
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
     * ### DOM.onFocusIn
     *
     * Registers a callback to be executed when the page acquires focus
     *
     * @param {function} cb Executed if page acquires focus
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
     * @param {function} cb Executed if page loses focus
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


    /**
     * ### DOM.blinkTitle
     *
     * Alternates between two titles
     *
     * Calling the function a second time clears the current
     * blinking. If called without arguments the current title
     * blinking is cleared.
     *
     * @param {string} title New title to blink
     * @param {string} alternateTitle Title to alternate
     */
    DOM.blinkTitle = function(id) {
        return function(titles, options) {
            var period, where, rotation;
            where = 'JSUS.blinkTitle: ';

            options = options || {};
            period = options.period || 1000 * titles.length;

            if (options.stopOnFocus) {
                JSUS.onFocusIn(function() {
                    JSUS.blinkTitle();
                });
            }
            if (options.startOnBlur) {
                options.startOnBlur = null;
                JSUS.onFocusOut(function() {
                    JSUS.blinkTitle(titles, options);
                });
                return;
            }
            if (null !== id) {
                clearInterval(id);
                id = null;
            }
            if ('undefined' !== typeof titles) {
                if ('string' === typeof titles) {
                    titles = [titles, '!!!'];
                } else if (!JSUS.isArray(titles)) {
                    throw new TypeError(where + 'titles must be string, ' +
                            ' array of strings or undefined.');
                }
                // Function to be executed every period.
                rotation = function() {
                    // For every title wait some time, then change title.
                    titles.forEach(function(title,i) {
                        setTimeout(function() {
                            changeTitle(title);
                        }, i * period/titles.length);
                    });
                };
                // Perform first rotation right now.
                rotation();
                id = setInterval(rotation,period);
            }
        };
    }(null);


    // ## Helper methods

    /**
     * ### onFocusChange
     *
     * Helper function for DOM.onFocusIn and DOM.onFocusOut (cross-browser)
     *
     * Expects only one callback, either inCb, or outCb.
     *
     * @param {function} inCb Optional. Executed if page acquires focus
     * @param {function} outCb Optional. Executed if page loses focus
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
                // Remove any pre-existing listeners.
                document.removeEventListener(event);
                if (onchangeCb) document.addEventListener(event, onchangeCb);

            }
            else if ('onfocusin' in document) {
                document.onfocusin = document.onfocusout = onchangeCb;
            }
            // All others.
            else {
                window.onpageshow = window.onpagehide
                    = window.onfocus = window.onblur = onchangeCb;
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
        if ("string" === typeof(title)) {
            document.title = title;
        }
        else {
            throw new TypeError("JSUS.changeTitle: title must be string.");
        }
    };

    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);
