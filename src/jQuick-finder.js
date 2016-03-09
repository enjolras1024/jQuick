//############################################################
// src/jQuick-finder.js
//############################################################
(function(window) {
  'use strict';

  var $ = window.jQuick;

  if (!$) {
    return;
  }

  var $pt = $.prototype;

  //############################################################
  // Find child
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

})(window);
