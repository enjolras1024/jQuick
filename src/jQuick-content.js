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
