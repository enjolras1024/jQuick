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
