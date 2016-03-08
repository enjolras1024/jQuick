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
   * @version   0.0.1
   * 
   * @class
   * @constructor
   * @param {Element|Window|Document|string} element
   * @param {Object} options
   */
  var $ = function jQuick(element, options) {
    if (!(this instanceof jQuick)) {
      return $.select( element, options );
    }
    //@todo How about two instances of jQuick manage one element? Maybe terrible. Only $.select can create new instance.
    this.element = null;
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


  $pt.focus = function() {//@todo
    var element = this.element;
    if ($.isElement(element) || $.isWindow(element)) {
      element.focus();
    }
    return this;
  };

  //############################################################
  // DOM event
  //############################################################

  /**
   * Just add DOM event listener.
   *
   * @param {string} type
   * @param {Function} func
   * @returns {self}
   */
  $pt.on = function(type, func) {
    var element = this.element;
    if (this.can(type)) {
      element.addEventListener(type, func, false);
    }
    return this;
  };

  /**
   * Just remove DOM event listener.
   *
   * @param {string} type
   * @param {Function} func
   * @returns {self}
   */
  $pt.off = function(type, func) {
    var element = this.element;
    if (this.can(type)) {
      element.removeEventListener(type, func, false);
    }
    return this;
  };

  /**
   * Check if this element can on event of given type.
   *
   * @param {string} type
   * @returns {boolean}
   */
  $pt.can = function(type) {
    return this.element && ('on' + type) in this.element;
  };

  //@todo document.documentElement
  $doc = new $(doc);

  window.jQuick = $;

})(window);
