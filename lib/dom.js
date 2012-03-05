(function (JSUS) {
    
    /**
     * Helper library to perform generic operation with DOM elements.
     * 
     * The general syntax is the following: Every HTML element has associated
     * a get* and a add* method, whose syntax is very similar.
     * 
     *         - The get* method creates the element and returns it.
     *         - The add* method creates the element, append it as child to
     *             a root element, and then returns it.
     * 
     * The syntax of both method is the same, but the add* method 
     * needs the root element as first parameter. E.g.
     * 
     *     getButton(id, text, attributes);
     *  addButton(root, id, text, attributes);
     *  
     * The last parameter is generally an object containing a list of 
     * of key-values pairs as additional attributes to set to the element.
     *   
     * Only the methods which do not follow the above-mentioned syntax
     * will receive further explanation. 
     * 
     */
    
    function DOM () {};

    
    /**
     * Write a text, or append an HTML element or node, into the
     * the root element.
     * 
     * @see DOM.writeln
     * 
     */
    DOM.write = function (root, text) {
        if (!root) return;
        if (!text) return;
        var content = (!JSUS.isNode(text) || !JSUS.isElement(text)) ? document.createTextNode(text) : text;
        root.appendChild(content);
        return content;
    };
    
    /**
     * Write a text, or append an HTML element or node, into the
     * the root element and adds a break immediately after.
     * 
     * @see DOM.writeln
     * 
     */
    DOM.writeln = function (root, text, rc) {
        if (!root) return;
        var br = this.addBreak(root, rc);
        return (text) ? DOM.write(root, text) : br;
    };
    
    
    /**
     * Returns TRUE if the object is a DOM node
     * 
     */
    DOM.isNode = function(o){
        return (
            typeof Node === "object" ? o instanceof Node : 
            typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    };
    
    /**
     * Returns TRUE if the object is a DOM element 
     * 
     */   
    DOM.isElement = function(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    };

    /**
     * Creates a generic HTML element with id and attributes as specified,
     * and returns it.
     * 
     * @see DOM.addAttributes2Elem
     * 
     */
    DOM.getElement = function (elem, id, attributes) {
        var e = document.createElement(elem);
        if ('undefined' !== typeof id) {
            e.id = id;
        }
        return this.addAttributes2Elem(e, attributes);
    };
    
    /**
     * Creates a generic HTML element with id and attributes as specified, 
     * appends it to the root element, and returns it.
     * 
     * @see DOM.getElement
     * @see DOM.addAttributes2Elem
     * 
     */
    DOM.addElement = function (elem, root, id, attributes) {
        var el = this.getElement(elem, id, attributes);
        return root.appendChild(el);
    };
    
    /**
     * Add attributes to an HTML element and returns it.
     * 
     * Attributes are defined as key-values pairs. 
     * Attributes 'style', and 'label' are ignored.
     * 
     * @see DOM.style
     * @see DOM.addLabel
     * 
     */
    DOM.addAttributes2Elem = function (e, a) {
        if (!e || !a) return e;
        if ('object' != typeof a) return e;
        var specials = ['id', 'label', 'style'];
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                if (!JSUS.in_array(key, specials)) {
                    e.setAttribute(key,a[key]);
                } else if (key === 'id') {
                    e.id = a[key];
                }
                
                // TODO: handle special cases
                
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
            }
        }
        return e;
    };
    
    /**
     * Appends a list of options into a HTML select element.
     * The second parameter list is an object containing 
     * a list of key-values pairs as text-value attributes for
     * the option.
     *  
     */
    DOM.populateSelect = function (select, list) {
        if (!select || !list) return;
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                var opt = document.createElement('option');
                opt.value = list[key];
                opt.appendChild(document.createTextNode(key));
                select.appendChild(opt);
            }
        }
    };
    
    // Get / Add Elements
    
    DOM.getButton = function (id, text, attributes) {
        var sb = document.createElement('button');
        sb.id = id;
        sb.appendChild(document.createTextNode(text || 'Send'));    
        return this.addAttributes2Elem(sb, attributes);
    };
    
    
    DOM.addButton = function (root, id, text, attributes) {
        var b = this.getButton(id, text, attributes);
        return root.appendChild(b);
    };
    
    
    DOM.getFieldset = function (id, legend, attributes) {
        var f = this.getElement('fieldset', id, attributes);
        var l = document.createElement('Legend');
        l.appendChild(document.createTextNode(legend));    
        f.appendChild(l);
        return f;
    };
    
    DOM.addFieldset = function (root, id, legend, attributes) {
        var f = this.getFieldset(id, legend, attributes);
        return root.appendChild(f);
    };
    
    DOM.getTextInput = function (id, attributes) {
        var mt =  document.createElement('input');
        mt.id = id;
        mt.setAttribute('type', 'text');
        return this.addAttributes2Elem(mt, attributes);
    };
    
    DOM.addTextInput = function (root, id, attributes) {
        var ti = this.getTextInput(id, attributes);
        return root.appendChild(ti);
    };
    
    DOM.getCanvas = function (id, attributes) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
            
        if (!context) {
            alert('Canvas is not supported');
            return false;
        }
        
        canvas.id = id;
        return this.addAttributes2Elem(canvas, attributes);
    };
    
    DOM.addCanvas = function (root, id, attributes) {
        var c = this.getCanvas(id, attributes);
        return root.appendChild(c);
    };
        
    DOM.getSlider = function (id, attributes) {
        var slider = document.createElement('input');
        slider.id = id;
        slider.setAttribute('type', 'range');
        return this.addAttributes2Elem(slider, attributes);
    };
    
    DOM.addSlider = function (root, id, attributes) {
        var s = this.getSlider(id, attributes);
        return root.appendChild(s);
    };
    
    DOM.getRadioButton = function (id, attributes) {
        var radio = document.createElement('input');
        radio.id = id;
        radio.setAttribute('type', 'radio');
        return this.addAttributes2Elem(radio, attributes);
    };
    
    DOM.addRadioButton = function (root, id, attributes) {
        var rb = this.getRadioButton(id, attributes);
        return root.appendChild(rb);
    };
    
//    DOM.addJQuerySlider = function (root, id, attributes) {
//        var slider = document.createElement('div');
//        slider.id = id;
//        slider.slider(attributes);
//        root.appendChild(slider);
//        return slider;
//    };
    
    DOM.getLabel = function (forElem, id, labelText, attributes) {
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
    

    DOM.addLabel = function (root, forElem, id, labelText, attributes) {
        if (!root || !forElem || !labelText) return false;        
        var l = this.getLabel(forElem, id, labelText, attributes);
        root.insertBefore(l, forElem);
        return l;
    };
    
    DOM.getSelect = function (id, attributes) {
        return this.getElement('select', id, attributes);
    };
    
    DOM.addSelect = function (root, id, attributes) {
        return this.addElement('select', root, id, attributes);
    };
    
    DOM.getIFrame = function (id, attributes) {
        var attributes = {'name' : id}; // For Firefox
        return this.getElement('iframe', id, attributes);
    };
    
    DOM.addIFrame = function (root, id, attributes) {
        var ifr = this.getIFrame(id, attributes);
        return root.appendChild(ifr);
    };
    
    DOM.addBreak = function (root, rc) {
        var RC = rc || 'br';
        var br = document.createElement(RC);
        return root.appendChild(br);
        //return this.insertAfter(br,root);
    };
    
    /**
     * If no root element is passed, it tries to add the CSS 
     * link element to document.head, document.body, and 
     * finally document. If it fails, returns FALSE.
     * 
     */
    DOM.addCSS = function (root, css, id, attributes) {
        var root = root || document.head || document.body || document;
        if (!root) return false;
        
        var attributes = attributes || {'rel' : 'stylesheet',
                                        'type': 'text/css'};
        
        attributes.href = css;
        
        var id = id || 'maincss';
        
        return this.addElement('link', root, id, attributes);
    };
    
    DOM.getDiv = function (id, attributes) {
        return this.getElement('div', id, attributes);
    };
    
    DOM.addDiv = function (root, id, attributes) {
        return this.addElement('div', root, id, attributes);
    };
    
    /**
     * Provides a simple way to highlight an HTML element
     * by adding a colored border around it.
     * 
     * Three pre-defined modes are implemented: 
     * 
     *         - OK:         green
     *         - WARN:     yellow
     *         - ERR:        red (default)
     * 
     * Alternatively, it is possible to specify a custom
     * color as HEX value. Examples:
     * 
     *  highlight(myDiv, 'WARN'); // yellow border
     *  highlight(myDiv);          // red border
     *  highlight(myDiv, '#CCC'); // grey border
     *  
     *  @see DOM.addBorder
     *  @see DOM.style
     * 
     */
    DOM.highlight = function (elem, code) {
        if (!elem) return;
        
        // default value is ERR        
        switch (code) {    
            case 'OK':
                var color =  'green';
                break;
            case 'WARN':
                var color = 'yellow';
                break;
            case 'ERR':
                var color = 'red';
                break;
            default:
                if (code[0] === '#') {
                    var color = code;
                }
                else {
                    var color = 'red';
                }
        }
        
        return this.addBorder(elem, color);
    };
    
    /**
     * Adds a border around the specified element. Color,
     * width, and type can be specified.
     * 
     */
    DOM.addBorder = function (elem, color, witdh, type) {
        if (!elem) return;
        
        var color = color || 'red';
        var width = width || '5px';
        var type = type || 'solid';
        
        var properties = { border: width + ' ' + type + ' ' + color }
        return this.style(elem,properties);
    };
    
    /**
     * Styles an element as an in-line css. 
     * Takes care to add new styles, and not overwriting previuous
     * attributes.
     * 
     * Returns the element.
     * 
     * @see DOM.setAttribute
     */
    DOM.style = function (elem, properties) {
        if (!elem || !properties) return;
        
        var style = '';
        for (var i in properties) {
            style += i + ': ' + properties[i] + '; ';
        };
        return elem.setAttribute('style',style);
    };
    
    /**
     * Removes a specific class from the class attribute
     * of a given element.
     * 
     * Returns the element.
     */
    DOM.removeClass = function (el, c) {
        if (!el || !c) return;
        var regexpr = '/(?:^|\s)' + c + '(?!\S)/';
        var o = el.className = el.className.replace( regexpr, '' );
        return el;
    };

    /**
     * Add a class to the class attribute of the given
     * element. Takes care not to overwrite already 
     * existing classes.
     * 
     */
    DOM.addClass = function (el, c) {
        if (!el || !c) return;
        if (c instanceof Array) c = c.join(' ');
        if ('undefined' === typeof el.className) {
            el.className = c;
        } else {
            el.className += ' ' + c;
        }
        return el;
      };
    
    /**
     * Remove all children from a node.
     * 
     */
    DOM.removeChildrenFromNode = function (e) {
        
        if (!e) return false;
        
        while (e.hasChildNodes()) {
            e.removeChild(e.firstChild);
        }
        return true;
    };
    
    /**
     * Insert a node element after another one.
     * 
     * The first parameter is the node to add.
     * 
     */
    DOM.insertAfter = function (node, referenceNode) {
          referenceNode.insertBefore(node, referenceNode.nextSibling);
    };
    
    /**
     * Generate a unique id for the page (frames included).
     * 
     * TODO: now it always create big random strings, it does not actually
     * check if the string exists.
     * 
     */
    DOM.generateUniqueId = function (prefix) {
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
    
    JSUS.extend(DOM);
    
})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);