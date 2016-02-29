//############################################################
// src/jQuick.js
//############################################################
(function(window) {
  'use strict';

  /**
   * @overview jQuick - A JavaScript library with limited and quick DOM APIs for modern browsers.
   *           Its APIs are similar to jQuery, but one instance of jQuick only manages one element.
   *
   * @copyright Copyright 2016 Enjolras. All rights reserved.
   * @license   Licensed under MIT license
   * @version 0.0.1
   * 
   * @class
   * @constructor
   * @param {Element|string} element
   * @param {Object} options
   */
  var $ = function jQuick(element, options) {
    if (this === undefined ||  this === window) {// <=> !(this instanceof jQuick)
      return $.select( element, options );
    }
    //@todo How about two instances of jQuick manage one element? Maybe terrible. Only $.select can create new instance.
    this.element = null; //@todo How about this.node
    //this._events = {};
    this.length = 0;

    if (!element) { return; }

    if (typeof element === 'string') {
      var expr = element.trim();
      if (expr[0] === '<'
        && expr[expr.length - 1] === '>'
        && expr.length >= 3) {
        element = $.parse(expr)[0];
      } else {
        element = $doc.query(expr);
      }
    }
    // para.nodeType is 1 or 9 or 11, or it is window.
    if ($.asParent(element) || $.isWindow(element)) { //@todo How about Text(nodeType is 3)?
      this.element = this[0] = element;
      this.length = element ? 1 : 0;//@todo this[0] and length are unnecessary.

      $.fix(element);
    }

    if (this.update) {
      this.update(options);
    }
  };

  //############################################################
  // Statics properties and methods
  //############################################################

  $.FIX = {
    CSS: { 'float': 'cssFloat' },
    HTML: { 'for': 'htmlFor', 'class': 'className' }
  };

  //@todo isString, isFunction, isPlainObject...

//    $.type = function ( obj ) {
//        return typeof obj;
//    };

  $.fix = function(element) {
    if ( ('className' in element) && (!('classList' in element) || !('add' in element.classList))) {
      element.classList = new ClassList(element);
    }
    //@todo ...
  };

  /**
   * Check if obj is an instance of jQuick.
   *
   * @static
   * @param {*} obj
   * @returns {boolean}
   */
  $.isjQuick = function(obj) {
    return obj instanceof $;
  };

  /**
   * See zepto.js
   *
   * @todo Why can not use DocumentFragment?
   * @todo <option></option>
   */
  var $doc, doc = window.document,
      table = doc.createElement('table'),
      tableRow = doc.createElement('tr');
  var containers = {
    '*': doc.createElement('div'),
    'tr': doc.createElement('tbody'),
    'td': tableRow, 'th': tableRow,
    'tbody': table, 'thead': table, 'tfoot': table
  };

  /**
   * Parse HTML string, and return the childNodes.
   *
   * @static
   * @param {string} html
   * @returns {Array}
   */
  $.parse = function(html) {
    var idx = html.indexOf(' '), name = html.slice(1, idx);
    //var div = doc.createElement( 'div' );
    if (!(name in containers)) { name = '*'; }
    var container = containers[name];
    container.innerHTML = html;

    var children = [], nodes = container.childNodes, n = nodes.length, i;
    
    for (i = 0; i < n; ++i) {
      children.push(nodes[i]);
    }
    //container.textContent ='';
    //return container.firstChild;
    return children;
  };

  /**
   * to-camel-case => toCamelCase.
   *
   * @static
   * @param {string} expr
   * @returns {string}
   */
  $.toCamelCase = function(expr) {
    return expr.replace(/-(.)?/g, function(match, char) {
      return char ? char.toUpperCase() : '';
    });
  };

  /**
   * Check if the element is window.
   *
   * @static
   * @param {*} element
   * @returns {boolean}
   */
  $.isWindow = function(element) {
    return element === window;
  };

  /**
   * Check if the child is an instance of Element. HTMLElement or SVGElement.
   * para.nodeType == 1.
   *
   * @static
   * @param {*} child
   * @returns {boolean}
   */
  $.isElement = function(child) {
    return child instanceof Element;
  };

  /**
   * Check if the child is an instance of Element or DocumentFragment.
   * para.nodeType == 1 or 11.
   *
   * @static
   * @param {*} child
   * @returns {boolean} - can be as child or not.
   */
  $.asChild = function (child) {
    return child instanceof Element
        || child instanceof Text
        || child instanceof DocumentFragment;
  };

  /**
   * Check if the parent is an instance of Element, Document or DocumentFragment.
   * para.nodeType == 1, 9 or 11.
   *
   * @static
   * @param parent
   * @returns {boolean} - can be as parent or not.
   */
  $.asParent = function(parent) {
    //return parent && ( 'childNodes' in parent );
    return parent instanceof Element
        || parent instanceof Document
        || parent instanceof DocumentFragment;
  };

  /**
   * Get the Element or DocumentFragment as child.
   *
   * @static
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {Element|DocumentFragment}
   */
  $.extract = function(child) {
    if ($.isjQuick(child)) {
      child =  child.element;
    }
    if ($.asChild(child)) {
      return child;
    }
    return null;
  };

  /**
   * Get classList from className.
   *
   * @static
   * @param {string} className
   * @returns {Array}
   */
  $.classList = function(className) {
    if (typeof className === 'string') {
      return className.trim().split(/\s+/);
    }
  };

  /**
   * Get the proxy of func in context.
   *
   * @todo return func.bind(context); unnecessary
   * @static
   * @param {Object} context
   * @param {string|Function} func
   * @returns {Function}
   */
  $.proxy = function(context, func) {
    if (typeof func === 'string') {
      func = context[func];
    }

    if (typeof func !== 'function') {
      return null;//undefined;
    }

    return function() {
      return func.apply(context, arguments);
    };

  };

  /**
   * Select or create an element and return an new jQuick instance.
   *
   * @static
   * @param {Element|string} element
   * @param {Object} options
   * @returns {jQuick}
   */
  $.select = function(element, options) {
    return new $(element, options);
//    var obj = element.jquick;
//    if (!obj) {
//      obj = new $(element, options);
//      obj.element.jquick = obj;
//    }
//    return obj;
  };

  /**
   * Create a fragment and return an new jQuick instance.
   *
   * @static
   * @param {Object} options
   * @returns {jQuick}
   */
  $.fragment = function(options) {
    return new $(doc.createDocumentFragment(), options);
  };

  var $pt = $.prototype;

  /**
   * Check if this instance of jQuick does not manage any element.
   *
   * @returns {boolean}
   */
  $pt.isEmpty = function() {
    return !!this.element;
  };

  //############################################################
  // DOM event
  //############################################################
  $pt.on = function(type, func) {
    var element = this.element;
    if (this.can(type)) {
      element.addEventListener(type, func, false);
    }
    return this;
  };

  $pt.off = function(type, func) {
    var element = this.element;
    if (this.can(type)) {
      element.removeEventListener(type, func, false);
    }
    return this;
  };

  $pt.can = function(type) {
    return this.element && ('on' + type) in this.element;
  };

  //@todo document.documentElement
  $doc = new $(doc);

  window.jQuick = $;

})(window);

//############################################################
// src/jQuick-access.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  //############################################################
  // access module - Update properties, attributes, value and style ...
  //############################################################

  /**
   * Initialize or update the properties, etc., of this instance.
   *
   * @alias set()?, init()?
   * @param {Object} options
   * @returns {self}
   */
  $pt.update = function(options) {
    options = options || {};
    var key, value, func;
    for (key in options) {
      if (!options.hasOwnProperty(key)) { continue; }
      func = this[key];
      value = options[key];
      if (typeof func === "function") {
        func.call(this, value);
      } else {
        this.attr(key, value);
      }
    }
    return this;
  };

  var FIX_HTML = $.FIX.HTML;// {'for': 'htmlFor', 'class': 'className'};

  /**
   * Get or set standard properties.
   *
   * @param {Object|string} key
   * @returns {jQuick|*}
   */
  $pt.prop = function(key) {
    var element = this.element, type = typeof key, value;
    if (!element) {
      return type === 'object' ? this : null;
    }

    if (type === 'object') {
      var props = key;
      for (key in props) {
        if (!props.hasOwnProperty(key)) { continue; }
        value = props[key];
        if (key in FIX_HTML) { key = FIX_HTML[key]; }
        element[key] = value;
      }
    } else if (type === 'string') {
      if (key in FIX_HTML) { key = FIX_HTML[key]; }
      return element[key];
    } else {
      throw new TypeError('key should be object or string');
    }

    return this;
  };

  /**
   * Get or set attributes. Maybe custom.
   *
   * @param {Object|string} key
   * @returns {jQuick|*}
   */
  $pt.attr = function(key) {
    var element = this.element, type = typeof key, value;
    if (!element) {
      return type === 'object' ? this : null;
    }

    if (!element.attributes) {
      return this.prop(key);
    } else if (type === 'object') {
      var options = key;
      for (key in options) {
        if (options.hasOwnProperty(key)) {
          value = options[key];
          if (value !== null) {
            element.setAttribute(key, value);
          } else {
            element.removeAttribute(key);
          }
        }
      }
    } else if (type === 'string') {
      return element.getAttribute(key);
    } else {
      throw new TypeError('key should be object or string');
    }

    return this;
  };

  /**
   * Get or set value.
   *
   * @todo How about nodeValue, option, select
   * @param {undefined|*} value
   * @returns {*|jQuick}
   */
  $pt.val = function(value) {
    var element = this.element;
    if (element.nodeName === 'select') {}//todo
    if (value === undefined) {
      return element && element.value;// || element.nodeValue;
    } else if (element) {
      element.value = value;
    }
    return this;
  };

  var FIX_CSS = $.FIX.CSS;// { 'float': 'cssFloat' };
  /**
   * Get or set style. Maybe computed.
   *
   * @param {Object|string} key
   * @returns {jQuick|*}
   */
  $pt.css = function(key) {
    var element = this.element, type = typeof key, value,
      style = $.isElement(element) ? element.style : null;

    if (!style) { return type === 'object' ? this : null; }//throw new Error( 'there is no style! ' ); }

    if (type === 'object') {
      var options = key;
      for (key in options) {
        if (options.hasOwnProperty(key)) {
          value = options[key];
          key = FIX_CSS[key] || $.toCamelCase(key);
          if (value === '' || value === null) {
            style.removeProperty(key);
          } else {
            style[key] = value;
          }
        }
      }
    } else if (type === 'string') {
      key = FIX_CSS[key] || $.toCamelCase(key);
      return style[key] || window.getComputedStyle(element)[key];
    }  else {
      throw new TypeError( 'key should be object or string' );
    }

    return this;
  };

  $pt.focus = function() {//@todo
    var element = this.element;
    if ($.isElement(element) || $.isWindow(element)) {
      element.focus();
    }
    return this;
  };

})(window);

//############################################################
// src/jQuick-classes.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  //############################################################
  // classes module - Update className
  //############################################################

  /**
   * It is a shim class for element.classList.
   * @todo more APIs, like item(), length...
   * @class
   * @constructor
   * @param {Element} element
   */
  function ClassList(element) {
    this.element = element;
    this.items = $.classList(element.className);
  }

  ClassList.prototype = {
    constructor: ClassList,

    get length() {
      return this.items.length;
    },

    item: function(index) {
      return this.items[index];
    },

    /**
     * Check if this classList has given className.
     *
     * @param {string} name
     * @returns {boolean}
     */
    contains: function(name) {
      var i, len, items = this.items;
      for (i = 0, len = items.length; i < len; ++i) {
        if (items[i] === name) { return true; }
      }
      return false;
    },

    /**
     * Add given className into classList.
     *
     * @param {string} name
     * @param {boolean} sure
     * @returns {boolean}
     */
    add: function(name,/*INTERNAL*/sure) {
      var items = this.items;
      if ( sure || !this.contains(name)) {
        items.push(name);
        this.element.className += ' ' + name;
        return true;
      }
      return false;
    },

    /**
     *
     * Remove given className from classList.
     *
     * @param {string} name
     * @returns {boolean}
     */
    remove: function(name) {
      var i, items = this.items, element = this.element;//, className = this.element.className;
      for (i = items.length -1; i >= 0; --i) {
        if (items[i] === name) {
          items.splice(i, 1);
          element.className = element.className.replace(name, '');
          return true;
        }
      }
      return false;
    },

    /**
     * Toggle given className in classList.
     *
     * @param {string} name
     * @returns {boolean}
     */
    toggle: function(name) {
      if (!this.remove(name)) {
        this.add(name, true);
      }
    }
  };

  /**
   * Update classList and className with given method in batch mode.
   * It is a internal method.
   *
   * @static
   * @param {jQuick} instance
   * @param {string} className - like 'btn' or 'btn active'
   * @param {string} method - 'add', 'remove' and 'toggle'
   */
  ClassList._update = function(instance, className, method) {
    if (!instance.element) { return; }
    var i, len, func, names = className.trim().split(/\s+/), classList = instance.element.classList;
    func = classList[method];
    for (i = 0, len = names.length; i < len; ++i) {
      func.call(classList, names[i])
    }
  };

  /**
   * Get the classList of element. Maybe created.
   *
   * @returns {ClassList|DOMTokenList}
   */
//  $pt.classList = function() {
//    var element = this.element;
//    if (!element) { return null; }
//    // IE11 do not support classList methods
//    if (!('classList' in element) || !('add' in element.classList)) {
//      element.classList = new ClassList(element);
//    }
//    return element.classList;
//  };

  /**
   * Check if this element has given class name.
   *
   * @param name - 'btn' but not 'btn active'
   * @returns {boolean}
   */
  $pt.hasClass = function(name) {
    return this.element && this.element.classList.contains(name);
  };

  /**
   * Add given class name.
   *
   * @param {string} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.addClass = function(name) {
    ClassList._update(this, name, 'add');
    return this;
  };

  /**
   * Remove given class name.
   *
   * @param {string} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.removeClass = function(name) {
    ClassList._update(this, name, 'remove');
    return this;
  };

  /**
   * Toggle given class name.
   *
   * @param {string} name - like 'btn' or 'btn active'
   * @returns {self}
   */
  $pt.toggleClass = function (name) {
    ClassList._update(this, name, 'toggle');
    return this;
  };

})(window);

//############################################################
// src/jQuick-content.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  //############################################################
  // content module - Replace content or adjust inner structure
  //############################################################

  /**
   * Get or set content by key.
   *
   * @param {jQuick} obj
   * @param {string} key
   * @param {undefined|string} value
   * @returns {string|jQuick}
   */
  function _content(obj, key, value) {
    var element = obj.element;
    if (value === undefined) {
      return element ? element[key] : null;
    }
    if (element && (key in element)) {
      element[key] = value;
    }
    return this;
  }

  /**
   * Get or set innerHTML. If value is undefined, innerHTML will be returned.
   *
   * @param {undefined|string} value
   * @returns {string|jQuick}
   */
  $pt.html = function(value) {
    return _content(this, 'innerHTML', value);
    /*var element = this.element;
     if ( typeof value === 'string' && 'innerHTML' in element ) {
     element.innerHTML = value;
     return this;
     }
     return element ? element.innerHTML : null;*/
  };

  /**
   * Get or set textContent. If value is undefined, textContent will be returned.
   *
   * @param {undefined|string} value
   * @returns {string|jQuick}
   */
  $pt.text = function(value) {
    return _content(this, 'textContent', value);
    /*var element = this.element;
     if ( typeof value === 'string' && 'textContent' in element ) {
     element.textContent = value;
     return this;
     }
     return element ? element.textContent : null;*/
  };

  /**
   * Empty the content.
   *
   * @returns {self}
   */
  $pt.empty = function() {
    //this.html('');
    return this.text('');
  };

  /**
   * Adjust the structure in this element.
   *
   * @param {jQuick} obj
   * @param {Element|DocumentFragment|jQuick} child
   * @param {Element|DocumentFragment|jQuick|undefined} node
   * @param {string} method - 'insertBefore','appendChild','removeChild',...
   * @returns {self}
   */
  function _adjust(obj, node, child, method) {
    var func, element = obj.element;// = element ? element[ method ] : null;
    node = $.extract(node); child = $.extract(child);
    if (element &&  node && (func = element[method])) {
      //func = element[ method ];
      func.call(element, node, child);
    }
    return obj;
  }

  function _check(node) {
    if (typeof node === 'string') {
      node = $.parse(node);
    }
    if (Array.isArray(node)/* || node instanceof  NodeList*/) { //@todo NodeList
      var nodes = [].slice.call(node, 0), n = nodes.length, i;
      node = $.fragment().element;
      for (i = 0; i < n; ++i) {
        node.appendChild($.extract(nodes[i]));
      }
      //nodes.splice(0);
    }
    return node;
  }

  /**
   * Insert child before node in this element.
   *
   * @alias prepend()
   * @param {Element|Text|DocumentFragment|jQuick|Array|string} node
   * @param {Element|jQuick} child
   * @returns {self}
   */
  $pt.insert = function(node, child) {
    node = _check(node);
    return _adjust(this, node, child, 'insertBefore');
    /*child = $.extract( child ); node = $.extract( node );
     var element = this.element;
     if ( element &&  child ) {
     element.insertBefore( child, node );
     }
     return this;*/
  };

  /**
   * Append child to this element.
   *
   * @param {Element|Text|DocumentFragment|jQuick|Array|string} node
   * @returns {self}
   */
  $pt.append = function(node) {
    node = _check(node);
    return _adjust(this, node, undefined, 'appendChild');
    /*child = $.extract( child );
     var element = this.element;
     if ( element && child ) {
     element.appendChild( child );
     }
     return this;*/
  };

  /**
   * Remove child from this element.
   *
   * @todo .depart(child,true) will remove all event listeners of child.
   * @param {Element|jQuick} child
   * @returns {self}
   */
  $pt.depart = function(child) {
    return _adjust(this, child, undefined, 'removeChild');
    /*child = $.extract( child );
     var element = this.element;
     if ( element && child ) {
     element.removeChild( child );
     }
     return this;*/
  };

  /**
   * Remove this element from its parent.
   *
   * @todo 'destroy' is better. remove(true) will remove all event listeners.
   * @returns {self}
   */
  $pt.remove = function() {
    var element = this.element,
      parent = element ? element.parentNode : null;
    if (parent) {
      parent.removeChild(element);
    }
    return this;
  };

  /**
   * Replace child with node in this element.
   *
   * @param {Element|Text|DocumentFragment|jQuick|Array|string} node
   * @param {Element|jQuick} child
   * @returns {self}
   */
  $pt.replace = function(node, child) {
    node = _check(node);
    return _adjust(this, node, child, 'replaceChild');
    /*child = $.extract( child ); node = $.extract( node );
     var element = this.element;
     if ( element && child && node ) {
     element.replaceChild( child, node );
     }
     return this;*/
  };

  /**
   * Replace this element with node in its parent.
   *
   * @todo Not nice.
   * @param {Element|DocumentFragment|jQuick|Array|string} node
   * @returns {self}
   */
//  $pt.replaceWith = function(node) {
//    var element = this.element,
//      parent = element ? element.parentNode : null;
//    if (parent) {
//      (new $(parent)).replace(node, element);
//    }
//    /*var parent = element ? element.parentNode : null;
//     if ( parent ) {
//     if ( typeof node === 'string' ) {
//     node = $.parse( node )[0];
//     }
//     parent.replaceChild( element, $.extract( node ) );
//     }*/
//    return this;
//  };

})(window);

//############################################################
// src/jQuick-event.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  //############################################################
  // event module - DOM event or custom event
  //############################################################

  var ActionUtil = {
    /**
     * Add DOM event or custom event listener.
     *
     * @param {jQuick} instance
     * @param {string|Object} type
     * @param {Function|string} func
     * @param {Object|undefined} context
     * @returns {boolean} - success or not
     */
    register: function(instance, type, func, context) {
      var element = instance.element,
          actions = instance._actions || {},
          action, handler, handlers, namespace, i, n;

      if (typeof func === 'string') {
        func = context[func];
      }
      // !(func instanceof Function)
      if (typeof func !== 'function') { return false; }

      // Extract event type and namespace.
      i = type.indexOf('.');
      if (i > 0) {
        namespace = type.slice(i + 1);
        type = type.slice(0, i);
      }

      action = actions[type];

      //  Create action, maybe add DOM event listener.
      if (!action) {// <=> action === undefined
        action = actions[type] = { handlers: []/*, listener: null*/ };
      }

      handlers = action.handlers;
      n = handlers.length;

      // Check if func exists in handlers.
      for (i = 0; i < n; ++i) {
        handler = handlers[i];
        if (func === handler.func) { return false; }
      }

      // Add handler successfully.
      handlers.push({
        //one: one,
        func: func,
        context: context,
        namespace: namespace
      });

      instance._actions = actions;

      if (!('listener' in action)) {
        if (this.can(type)) {//@todo No problem?
          action.listener = function(domEvent) {
            instance.trigger(domEvent);
          };
          element.addEventListener(type, action.listener, false);
        } else {
          action.listener = null;
        }
      }

      return true;
    },

    /**
     * Remove DOM event or custom event listener.
     *
     * @param {jQuick} instance
     * @param {string|Object} type
     * @param {Function|string} func
     * @param {Object|undefined} context
     * @returns {boolean} - success or not
     */
    remove: function(instance, type, func, context) {
      var element = instance.element, actions = instance._actions,
          action, handler, handlers, i, n, namespace;

      if (!actions) { return false; }

      // Extract event type and namespace.
      i = type.indexOf('.');
      if (i > 0) {
        namespace = type.slice(i + 1);
        type = type.slice(0, i);
      }

      action = actions[type];

      if (!action) { return false; }
      //else if ( namespace ) { off('.ns'); }

      handlers = action.handlers;
      n = handlers.length;

      if (typeof func === 'string') {
        func = context[func];
      }

      if (!namespace) {
        if (arguments.length === 2) { // Remove all actions of type.
          handlers.splice(0);
        } else { // Remove handler in actions of type.
          for (i = 0; i < n; ++i) {
            handler = handlers[i];
            if (func === handler.func) {
              handlers.splice(i, 1);
              break;
            }
          }
        }
      } else { // Remove handlers in actions of type in namespace.
        for (i = n - 1; i >= 0; --i) {
          handler = handlers[ i ];
          if (namespace === handler.namespace
            && (!func || func === handler.func)) {
            handlers.splice(i, 1);
          }
        }
      }

      // Remove DOM event listener.
      if (handlers.length === 0) {
        if (action.listener) {/* <=> element && ('on' + type) in element*/
          element.removeEventListener(type, action.listener, false);
        }
        delete actions[type];
      }

      return true;
    },

    clear: function(instance) {
      var actions = instance._actions, key;

      if (!actions) { return false; }

      for (key in actions) {
        if (!actions.hasOwnProperty(key)) { continue; }
        ActionUtil.remove(instance, key);
      }
    }
  };

  /**
   * Use ActionUtil to add DOM event or custom event listener.
   *
   * @todo .on(type, func, context, useCapture, one)
   * @param {string|Object} type
   * @param {Function|string} func
   * @param {Object|undefined} context
   * @returns {self}
   */
  $pt.on = function(type, func, context) {
    var t = typeof type, key, value;

    if (t === 'string') {
      //  .on('click', context.onClick);
      //  .on('click', 'onClick', context);
      ActionUtil.register(this, type, func, context);
    } else if (t === 'object') {
      //  .on({
      //    click: function(){...},
      //    start: ['onStart',context]
      //  });
      for (key in type) {
        if (!type.hasOwnProperty(key)) { continue; }
        value = type[key];
        if (!Array.isArray(value)){
          value = [value];
        }
        ActionUtil.register.apply(ActionUtil, [this, key].concat(value));
      }
    }

    return this;
  };


  /**
   * Use ActionUtil to remove DOM event or custom event listener.
   *
   * @todo useCapture
   * @param {string|Object} type
   * @param {Function|string} func
   * @param {Object|undefined} context
   * @returns {self}
   */
  $pt.off = function(type, func, context) {
    var t = typeof type, key, value;

    if (arguments.length === 0) {
      // .off()
      ActionUtil.clear(this);
    } else if (t === 'string') {
      //  .off('click', context.onClick);
      //  .off('click', 'onClick', context);
      ActionUtil.remove(this, type, func, context);
    } else if (t === 'object') {
      //  .off({
      //    click: context.onClick,
      //    start: ['onStart',context]
      //  });
      for (key in type) {
        if (!type.hasOwnProperty(key)) { continue; }
        value = type[key];
        if (!Array.isArray(value)){
          value = [value];
        }
        ActionUtil.remove.apply(ActionUtil, [this, key].concat(value));
      }
    }

    return this;
  };

  /**
   * Dispatch custom event with data.
   *
   * @alias emit()
   * @param {Event|Object|string} type
   * @param {*} data
   * @returns {self}
   */
  $pt.trigger = function(type, data) {
    var actions = this._actions, handlers, handler, context, func, i, n, event, namespace;

    if (!actions) { return this; }

    // TODO: Fix event of type.
    if (typeof type === 'string') {
      i = type.indexOf('.');
      if (i > 0) {
        namespace = type.slice(i + 1);
        type = type.slice(0, i);
      }
      event = { type: type, target: null };
    } else if ('type' in type) {
      event = type;
      type = event.type;
      namespace = event.namespace;
    }

    if (!(type in actions)) { return this; }

    event.trigger = this;
    if (!('data' in event)) {
      event.data = data;
    }

    handlers = actions[type].handlers;
    n = handlers.length;

    // Fire handlers in namespace.
    for (i = 0; i < n; ++i) {
      handler = handlers[i];// handlers[ i ]( event.clone() );
      if (!namespace || namespace === handler.namespace) {
        context = handler.context;
        func = handler.func;
        if (context) {
          func.call(context, event);
        } else {
          func(event);
        }

      }
    }

    return this;
  };

})(window);
