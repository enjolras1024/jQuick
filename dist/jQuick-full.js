//############################################################
// src/jQuick.js
//############################################################
(function(window) {
  'use strict';

  /**
   * A JavaScript library with limited and quick DOM APIs for modern browsers.
   * Its APIs are similar to jQuery, but one instance of jQuick only manages one element.
   *
   * @todo How about two instances of jQuick manage one element? Maybe terrible. Only $.select can create new instance.
   *
   * @copyright Copyright 2016 Enjolras. All rights reserved.
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

    this.element = null; //@todo How about this.node
    //this._events = {};
    this.length = 0;

    if (!element) { return; }

    if (typeof element === 'string') {
      var expr = element.trim();
      if (expr[0] === '<'
        && expr[expr.length - 1] === '>'
        && expr.length >= 3) {
        element = $.parse(expr).item(0);
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
   * @returns {NodeList}
   */
  $.parse = function(html) {
    var idx = html.indexOf(' '), name = html.slice(1, idx);
    //var div = doc.createElement( 'div' );
    if (!(name in containers)) { name = '*'; }
    var container = containers[name];
    container.innerHTML = html;
    //return container.firstChild;
    return container.childNodes;
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
// src/jQuick-getter.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  //############################################################
  // Get child or self
  //############################################################

  /**
   * Get the childNode at given position.
   *
   * @todo Maybe unnecessary.
   * @param {number} idx
   * @returns {Node}
   */
//  $pt.node = function (idx) {
//    var element = this.element;
//    //return element ? element.children[ idx ] : null;
//    return $.asParent(element) ? element.childNodes[idx] : null;
//  };

  /**
   * Get the child at given position.
   *
   * @param {number} idx
   * @returns {jQuick}
   */
  $pt.child = function (idx) {
    var element = this.element,
      child = $.asParent(element) ? element.childNodes[idx] : null;
    return child ? new $(child) : null;
  };

  /**
   * Get all the children or some by selector.
   *
   * @param {undefined|string} selector
   * @returns {Array}
   */
  $pt.children = function(selector) {
    var element = this.element;
    if (!$.asParent(element)) { return null; }

    var i, n, matches, anyway = selector === undefined,
      elements = element.childNodes, children = [];

    element = elements[0];

    if (element) {
      matches = element.matches || element.matchesSelector;
    }
    /**
     * @todo How about nodeType !== 1, such as Text.
     */
    for (i = 0, n = elements.length; i < n; ++i) {
      element = elements[i];
      if (/*$.isElement(element) && */(anyway ||  matches.call(element, selector))) {
        children.push(new $(element));
      }
    }

    return children;
  };

  /**
   * Clone this instance.
   *
   * @returns {self}
   */
  $pt.clone = function() {
    var element = this.element;
    return (element instanceof Node) ? new $(element.cloneNode(true)) : new $();
  };

  /**
   * Query an element by selector.
   *
   * @todo How about getElementById and getElementByClassName.
   * @param {string} selector
   * @returns {Element}
   */
  $pt.query = function(selector) {
    var element = this.element;
    return $.asParent(element) ? element.querySelector(selector) : null;
  };
  /**
   * Query all elements by selector.
   *
   * @param {string} selector
   * @returns {Array}
   */
  $pt.queryAll = function(selector) {
    var element = this.element;
    return $.asParent(element) ? element.querySelectorAll(selector) : [];
  };

  /**
   * Find the jQuick child.
   *
   * @alias select()
   * @param {string}  selector
   * @returns {self}
   */
  $pt.find = function(selector) {
    return new $(this.query(selector));
  };

  /**
   * Find all the jQuick children.
   *
   * @todo maybe unnecessary
   * @param {string} selector
   * @returns {Array}
   */
  $pt.findAll = function(selector) {
    var i, n, children = [], elements = this.queryAll(selector);
    for (i = 0, n = elements.length; i < n; ++i) {
      children.push(new $(elements[i]));
    }
    return children;
  };


  //############################################################
  // Get property, attribute, value and style ...
  //############################################################

  var FIX_HTML = $.FIX.HTML;// {'for': 'htmlFor', 'class': 'className'};

  /**
   * Get standard property.
   *
   * @param {string} key
   * @returns {*}
   */
  $pt.prop = function(key) {
    var element = this.element;
    if (element && typeof key === 'string') {
      if (key in FIX_HTML) { key = FIX_HTML[key]; }
      return element[key];
    }
  };

  /**
   * Get attribute.
   *
   * @param {string} key
   * @returns {*}
   */
  $pt.attr = function(key) {
    var element = this.element;
    if (element) {
      if (!element.attributes) {
        return this.prop(key);
      } else if (typeof key === 'string') {
        return element.getAttribute(key);
      }
    }
  };

  var FIX_CSS = $.FIX.CSS;// { 'float': 'cssFloat' };
  /**
   * Get style.
   *
   * @param {string} key
   * @returns {*}
   */
  $pt.css = function(key) {
    var element = this.element, style = $.isElement(element) ? element.style : null;

    if (style && typeof key === 'string') {
      key = FIX_CSS[key] || $.toCamelCase(key);
      return style[key] || window.getComputedStyle(element)[key];
    }
  };

  /**
   * Get value.
   *
   * @todo How about nodeValue, option, select
   * @returns {*}
   */
  $pt.val = function() {
    var element = this.element;
    //if (element.nodeName === 'select') {}//todo
    return element && element.value;
  };

})(window);

//############################################################
// src/jQuick-buffer.js
//############################################################
(function(window) {
  'use strict';

  var doc = window.document;

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

  var FIX_HTML = $.FIX.HTML,//{'for': 'htmlFor', 'class': 'className'},
      FIX_CSS = $.FIX.CSS;//{ 'float': 'cssFloat' };

  //############################################################
  // buffer module - Update asynchronously
  //############################################################

  /**
   * Single buffer. Don't care about if the given value is new. In next tick all parts in buffer will be rendered.
   * We can think of virtual-dom based on double buffers, or compare give value with current value.
   *
   * @property {Object} buffer
   */
  Object.defineProperty($pt, 'buffer', {
    get: function() {
      if (!this._buffer && $.isElement(this.element)) {
        this._buffer = new Buffer(this.element);
      }
      return this._buffer;
    }
  });

  var ContentUtil = {
    textContent: function(buffer, value) {
      if (typeof value === 'string') {
        var child, children = buffer.pool.children = [];
        child = doc.createTextNode(value);
        child.futureParent = buffer.element;
        children.push(child);
      }
    },
    innerHTML: function(buffer, value) {
      if (typeof value === 'string') {
        var child, children = buffer.pool.children = [], nodes = $.parse(value);
        console.log(nodes);
        for (var i = 0, n = nodes.length; i < n; ++i) {
          child = nodes.item(i);
          child.futureParent = buffer.element;
          children.push(child);
        }
      }
    }
  };

  /**
   *
   * @class
   * @constructor
   * @param {Element} element
   */
  function Buffer(element) {
    this.element = element;
    this._pool = null;
  }

  Buffer.prototype = {
    constructor: Buffer,

    get pool() {
      if (!this._pool) {
        this._pool = {
          attrs: {},
          props: {},
          style: {},
          //content: '',
          classes: null,//@todo conflict with props.className?
          children: null
        };

        buffers[bufferIndex].push(this);
        if (!flag) {
          flag = true;
          requestAnimationFrame(tick/*, document.body*/);
        }
      }
      return this._pool;
    },

    clear: function() {
      this._pool = null;
    },

    //@todo updateAsyncBatch, insertAsyncBatch...

    /**
     * Remove the key in  the part of given type in pool.
     *
     * @param {string} type
     * @param {string} key
     * @returns {self}
     */
    cancel: function(type, key) {
      var part = this.pool[type];
      delete part[key];
      return this;
    },

    /**
     * Update the part of given type in pool.
     *
     * @param {string} type
     * @param {string} key
     * @param {*} value
     * @returns {self}
     */
    update: function(type, key, value) {
      if ( key in ContentUtil &&  type === 'props' ) {
        var render = ContentUtil[key];
        render(this, value);
      } else {
        var part = this.pool[type];
        part[key] = value;
      }

      return this;
    },

    prop: function(key, value) {
      return this.update('props', key, value);
    },

    attr: function(key, value) {
      return this.update('attrs', key, value);
    },

    css: function(key, value) {
      return this.update('style', key, value);
    },

    val: function(value) {
      return this.update('props', 'value', value);//@todo select
    },

    text: function(value) {
      return this.update('props', 'textContent', value);
    },

    html: function(value) {
      return this.update('props', 'innerHTML', value);
    },

    /**
     * If pool.classes is null, we need to initialize it firstly.
     */
    checkClass: function() {
      var pool = this.pool, classes = pool.classes;
      if (!classes) {
        var classList = this.element.classList;
        classes = pool.classes = {};
        for (var i = 0, n = classList.length; i < n; ++i) {
          classes[classList.item(i)] = 1;
        }
      }
    },

    /**
     * Add class asynchronously.
     *
     * @param {string} name
     * @returns {self}
     */
    addClass: function(name) {
      this.checkClass();
      this.pool.classes[name] = 1;
      return this;
      //return this.update('classes', name, 1);
    },

    /**
     * Remove class asynchronously.
     *
     * @param {string} name
     * @returns {self}
     */
    removeClass: function(name) {
      this.checkClass();
      delete this.pool.classes[name];
      return this;
      //return this.update('classes', name, 0);
    },

    /**
     * Insert child asynchronously. Order is important.
     *
     * @param {Element|Text} child
     * @param {Element|Text} before
     * @returns {self}
     */
    insert: function(child, before) {//@todo How about DocumentFragment or Array?
      var i, j, n, children = this.pool.children;
      if (!children) {
        children = this.pool.children = [].slice.call(this.element.childNodes, 0);
      }

      n = children.length;

      if (before) {
        if (child === before ) { return this; }
        for (i = 0; i < n; ++i) {
          if (children[i] === before) {
            break;
          }
        }
      } else {
        if (child === children[n-1] ) { return this; }
        i = n;
      }

      if (i < n) {
        children.splice(i, 0, child);
      } else {
        children.push(child);
      }
      child.futureParent = this.element;//stepparent

      for (j = n; j >= 0; --j) {
        if (j !== i && children[j] === child) {
          children.splice(j, 1);
          break;
        }
      }

      return this;
    },

    /**
     * Remove child asynchronously. Order is important.
     *
     * @param {Element|Text} child
     * @returns {self}
     */
    remove: function(child) {
      var i, n, children = this.pool.children;
      if (!children) {
        children = this.pool.children = [].slice.call(this.element.childNodes, 0);
      }

      for (i = 0, n = children.length; i < n; ++i) {
        if (children[i] === child) {
          child.futureParent = null;
          break;
        }
      }

      if (i < n -1) {
        children.splice(i, 1);
      } else {
        children.pop();
      }

      return this;
    },

    render: function() {
      var pool = this.pool, element = this.element;

      this.clear();
      //if (!$.isElement(element)) { return; }

      var key, value,
        attrs = pool.attrs,
        props = pool.props,
        style = pool.style,
        classes = pool.classes,
        children = pool.children;

      //update properties
      for (key in props) {
        if (!props.hasOwnProperty(key)) { continue; }
        if (key in FIX_HTML) { key = FIX_HTML[key]; }
        element[key] = props[key];
        //@todo innerHTML, textContent
      }

      //update attributes
      for (key in attrs) {
        if (!attrs.hasOwnProperty(key)) { continue; }
        value = attrs[key];
        if (value !== null) {
          if (value !== null) {
            element.setAttribute(key, value);
          } else {
            element.removeAttribute(key);
          }
        }
      }

      //update style
      for (key in style) {
        if (!style.hasOwnProperty(key)) { continue; }
        value = style[key];
        key = FIX_CSS[key] || $.toCamelCase(key);
        if (value === '' || value === null) {
          element.style.removeProperty(key);
        } else {
          element.style[key] = value;
        }
      }

//      for (key in classes) {
//        if (!classes.hasOwnProperty(key)) { continue; }
//        if (classes[key] > 0) {
//          element.classList.add(key);//@todo
//        } else {
//          element.classList.remove(key);//@todo
//        }
//      }

      var i, n;

      if (classes) {
        //update className
        var classList = element.classList;

        for (i = 0, n = classList.length; i < n; ++i) {
          key = classList.item(i);
          if (key in classes) {
            classes[key] = 0;
          } else {
            classList.remove(key);
          }
        }

        for (key in classes) {
          if (classes.hasOwnProperty(key) && classes[key]) {
            classList.add(key);
          }
        }
      }

      if (children) {
        //update children
        var m, min, offset, child;

        if ( children.length === 1 && children[0] instanceof Text) {
          element.textContent = children[0].textContent;
          delete children[0].futureParent;
          return;
        } else if (children.length === 0) {
          element.textContent = '';
          return;
        }

        /**
         * We guess that inserting or removing non-end child will cause removing and reinserting the following children.
         * So if children.length is N, and we insert a new child at index K, then the following N-K children will be
         * removed firstly, and the new child and removed N-K children will be inserted in order later.
         */

        for (i = children.length - 1; i >= 0; --i) {
          child = children[i];
          if (child.futureParent !== element && child.parentNode !== element) {
            children.splice(i, 1);
          }
        }

        m = element.childNodes.length;
        n = children.length;
        min = m < n ? m : n;

        for (i = 0; i < min; ++i) {
          if (children[i] !== element.childNodes[i]) {
            break;
          }
        }

        offset = i;

        for (i = m - 1; i >= offset; --i) {
          child = element.childNodes[i];
          if (child.parentNode === element) {
            element.removeChild(child);
          }
        }

        for (i = offset; i < n; ++i) {
          child = children[i];
          delete child.futureParent;
          element.appendChild(child);
        }
      }

    }
  };

  var bufferIndex = 0, buffers = [[],[]], flag = false;// double buffers

  //b = buffer, buffer = []?

  function tick() {
    //if(stop) return;
    flag = false;
    //requestAnimationFrame(tick/*, document.body*/);

    var i, len, buffer = buffers[bufferIndex];

    len = buffer.length;
    // Nothing to refresh
    if (len <= 0) { return; }

    bufferIndex = bufferIndex ? 0 : 1;// exchange

    for (i = 0; i < len; ++i) {
      buffer[i].render();
    }

    buffer.splice(0);
  }

  tick();

})(window);
//var stop = false;
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

  /**
   * Insert child before node in this element.
   *
   * @alias prepend()
   * @param {Element|DocumentFragment|jQuick|string} node
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {self}
   */
  $pt.insert = function(node, child) {
    if (typeof node === 'string') {
      node = $.parse(node).item(0);//@todo How about NodeList or Array?
    }
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
   * @param {Element|DocumentFragment|jQuick|string} node
   * @returns {self}
   */
  $pt.append = function(node) {//@todo How about NodeList or Array?
    if (typeof node === 'string') {
      node = $.parse(node).item(0);
    }
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
   * @param {Element|DocumentFragment|jQuick} child
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
   * @param {Element|DocumentFragment|jQuick|string} node
   * @param {Element|DocumentFragment|jQuick} child
   * @returns {self}
   */
  $pt.replace = function(node, child) {//@todo How about NodeList or Array?
    if (typeof node === 'string') {
      node = $.parse(node).item(0);
    }
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
   * @param {Element|DocumentFragment|jQuick|string} node
   * @returns {self}
   */
  $pt.replaceWith = function(node) {
    var element = this.element,
      parent = element ? element.parentNode : null;
    if (parent) {
      (new $(parent)).replace(element, node);
    }
    /*var parent = element ? element.parentNode : null;
     if ( parent ) {
     if ( typeof node === 'string' ) {
     node = $.parse( node ).item(0);
     }
     parent.replaceChild( element, $.extract( node ) );
     }*/
    return this;
  };

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
        if (element && ('on' + type) in element) {//@todo No problem?
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
