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

})(window);
