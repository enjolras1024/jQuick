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


  var nextTick = window.requestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.oRequestAnimationFrame
          || window.msRequestAnimationFrame;

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
        for (var i = 0, n = nodes.length; i < n; ++i) {
          child = nodes[i];
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
          nextTick(tick/*, document.body*/);
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
      var t = typeof key;
      if (t === 'string') {
        if ( key in ContentUtil &&  type === 'props' ) {
          var render = ContentUtil[key];
          render(this, value);
        } else {
          var part = this.pool[type];
          part[key] = value;
        }
      } else if (t === 'object') {
        var options = key;
        for (key in options) {
          if (options.hasOwnProperty(key)) {
            this.update(type, key, options[key]);
          }
        }
      } else {
        throw new TypeError('key should be string or object');
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
     * @alias add
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
     * @alias cut
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