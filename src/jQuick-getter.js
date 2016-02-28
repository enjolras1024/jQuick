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
