/**
 * # DOM
 *
 * Copyright(c) 2013 Stefano Balietti
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
 * ---
 */
(function(JSUS) {

    function DOM() {};

    // ## GENERAL

    /**
     * ### DOM.write
     *
     * Write a text, or append an HTML element or node, into the
     * the root element.
     *
     * @see DOM.writeln
     */
    DOM.write = function(root, text) {
        if (!root) return;
        if (!text) return;
        var content = (!JSUS.isNode(text) || !JSUS.isElement(text)) ?
            document.createTextNode(text) : text;
        root.appendChild(content);
        return content;
    };

    /**
     * ### DOM.writeln
     *
     * Write a text, or append an HTML element or node, into the
     * the root element and adds a break immediately after.
     *
     * @see DOM.write
     * @see DOM.addBreak
     */
    DOM.writeln = function(root, text, rc) {
        if (!root) return;
        var br = this.addBreak(root, rc);
        return (text) ? DOM.write(root, text) : br;
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
     * @param {string} string A text to transform
     * @param {object} args Optional. An object containing string transformations
     * @param {Element} root Optional. An HTML element to which append the
     *    string. Defaults, a new _span_ element
     *
     * @return {Element} root The root element.
     */
    DOM.sprintf = function(string, args, root) {

        var text, textNode, span, idx_start, idx_finish, idx_replace, idxs;
        var spans, key, i, returnElement;

        // If no formatting arguments are provided, just create a string
        // and inserted into a span tag. If a root element is provided, add it.
        if (!args) {
            returnElement = document.createElement('span');
            returnElement.appendChild(document.createTextNode(string));
            return root ? root.appendChild(returnElement) : returnElement;
        }

        root = root || document.createElement('span');
        spans = {};

        // Transform arguments before inserting them.
        for (key in args) {
            if (args.hasOwnProperty(key)) {

                // Pattern not found.
                if (idx_start === -1) continue;

                switch(key.charAt(0)) {

                case '%': // Span.

                    idx_start = string.indexOf(key);
                    idx_replace = idx_start + key.length;
                    idx_finish = string.indexOf(key, idx_replace);

                    if (idx_finish === -1) {
                        JSUS.log('Error. Could not find closing key: ' + key);
                        continue;
                    }

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

        // No span to creates.
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

            span = JSUS.getElement('span', null, args[key]);

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
    }

    /**
     * ### DOM.isNode
     *
     * Returns TRUE if the object is a DOM node
     *
     * @param {mixed} The variable to check
     * @return {boolean} TRUE, if the the object is a DOM node
     */
    DOM.isNode = function(o) {
        return 'object' === typeof Node ? o instanceof Node :
            'object' === typeof o &&
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
     * @return {boolean} TRUE, if the the object is a DOM element
     */
    DOM.isElement = function(o) {
        return 'object' === typeof o && o.nodeType === 1 &&
            'string' === typeof o.nodeName;
    };

    /**
     * ## DOM.shuffleNodes
     *
     * Shuffles the children nodes
     *
     * @param {Node} parent The parent node
     * @param {array} order Optional. A pre-specified order. Defaults, random
     */
    DOM.shuffleNodes = function(parent, order) {
        var i, len;
        if (!JSUS.isNode(parent)) {
            throw new TypeError('DOM.shuffleNodes: parent must node.');
        }
        if (!parent.children || !parent.children.length) {
            JSUS.log('DOM.shuffleNodes: parent has no children.', 'ERR');
            return false;
        }
        if (order) {
            if (!J.isArray(order)) {
                throw new TypeError('DOM.shuffleNodes: order must array.');
            }
            if (order.length !== parent.children.length) {
                throw new Error('DOM.shuffleNodes: order length must match ' +
                                'the number of children nodes.');
            }
        }

        len = parent.children.length;

        if (!order) order = JSUS.sample(0,len);
        for (i = 0 ; i < len; i++) {
            parent.appendChild(parent.children[order[i]]);
        }

        return true;
    };

    /**
     * ### DOM.getElement
     *
     * Creates a generic HTML element with id and attributes as specified,
     * and returns it.
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
     * Creates a generic HTML element with id and attributes as specified,
     * appends it to the root element, and returns it.
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
     * Attributes 'label' is ignored.
     *
     * @see DOM.addLabel
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
                else if (key === 'class') {
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
                //                else {
                //
                //                    // If there is no parent node, the legend cannot be created
                //                    if (!e.parentNode) {
                //                        node.log('Cannot add label: no parent element found', 'ERR');
                //                        continue;
                //                    }
                //
                //                    this.addLabel(e.parentNode, e, a[key]);
                //                }
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

        if (!e) return false;

        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
        return true;
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
        };


        return scanDocuments(prefix + '_' + JSUS.randomInt(0, 10000000));
        //return scanDocuments(prefix);
    };

    /**
     * ### DOM.getBlankPage
     *
     * Creates a blank HTML page with the html and body
     * elements already appended.
     *
     */
    DOM.getBlankPage = function() {
        var html = document.createElement('html');
        html.appendChild(document.createElement('body'));
        return html;
    };

    //    DOM.findLastElement = function(o) {
    //        if (!o) return;
    //
    //        if (o.lastChild) {
    //            var e
    //            JSUS.isElement(e)) return DOM.findLastElement(e);
    //
    //            var e = e.previousSibling;
    //            if (e && JSUS.isElement(e)) return DOM.findLastElement(e);
    //
    //        return o;
    //    };

    // ## GET/ADD

    /**
     * ### DOM.getButton
     *
     */
    DOM.getButton = function(id, text, attributes) {
        var sb = document.createElement('button');
        sb.id = id;
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
        var root = root || document.head || document.body || document;
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
        var root = root || document.head || document.body || document;
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
     * @return {HTMLElement} elem The styled element
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
     * @return {HTMLElement|undefined} el The HTML element with the removed
     *   class, or undefined input are misspecified.
     */
    DOM.removeClass = function(el, c) {
        var regexpr, o;
        if (!el || !c) return;
        regexpr = '/(?:^|\s)' + c + '(?!\S)/';
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
     * @return {HTMLElement|undefined} el The HTML element with the additional
     *   class, or undefined input are misspecified.
     */
    DOM.addClass = function(el, c) {
        if (!el || !c) return;
        if (c instanceof Array) c = c.join(' ');
        if ('undefined' === typeof el.className) {
            el.className = c;
        }
        else {
            el.className += ' ' + c;
        }
        return el;
    };

    /**
     * ## DOM.getIFrameDocument
     *
     * Returns a reference to the document of an iframe object
     *
     * @param {HTMLIFrameElement} iframe The iframe object
     * @return {HTMLDocument|undefined} The document of the iframe, or
     *   undefined if not found.
     */
    DOM.getIFrameDocument = function(iframe) {
        if (!iframe) return;
        return iframe.contentDocument || iframe.contentWindow.document;
    };

    /**
     * ### DOM.getIFrameAnyChild
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {HTMLIFrameElement} iframe The iframe object
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

    /**
     * ### DOM.getElementsByClassName
     *
     * Gets the first available child of an IFrame
     *
     * Tries head, body, lastChild and the HTML element
     *
     * @param {string} className The requested className
     * @param {string}  nodeName Optional. If set only elements with
     *   the specified tag name will be searched
     * @return {array} Array of elements with the requested class name
     *
     * @see https://gist.github.com/E01T/6088383
     */
    DOM..getElementsByClassName = function(className, nodeName) {
        var result, node, tag, seek, i, rightClass;
        result = [], tag = nodeName || '*';
        if (document.evaluate) {
            seek = '//'+ tag +'[@class="'+ className +'"]';
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
} 


    JSUS.extend(DOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);