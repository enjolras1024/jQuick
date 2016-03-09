//############################################################
// src/jQuick-getter.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) { return; }

  var $pt = $.prototype;

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
