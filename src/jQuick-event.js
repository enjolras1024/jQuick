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
    parse: function(type) {
      var namespace, event, i;
      // TODO: Fix event of type.
      if (typeof type === 'string') {
        i = type.indexOf('.');
        if (i > 0) {
          namespace = type.slice(i + 1);
          type = type.slice(0, i);
        }
        event = { type: type, target: null, namespace: namespace };
      } else if ('type' in type) {
        event = type;
      }

      return event;
    },
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
        if (instance.can(type)) {//@todo No problem?
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

    dispatch: function(instance, method, type) {
      var actions = instance._actions, paras, handlers, handler,
        context, func, i, n, event, namespace;

      if (!actions) { return; }

      event = ActionUtil.parse(type);
      type = event.type;
      namespace = event.namespace;

      if (!(type in actions)) { return; }

      event.dispatcher = instance;

      if (method === 'emit') {
        paras = [].slice.call(arguments, 3);
      } else if (!('data' in event)) {
        event.data = arguments[3];
        paras = [event];
      }

      handlers = actions[type].handlers;
      n = handlers.length;

      // Fire handlers in namespace.
      for (i = 0; i < n; ++i) {
        handler = handlers[i];// handlers[ i ]( event.clone() );
        if (!namespace || namespace === handler.namespace) {
          context = handler.context;
          func = handler.func;
          func.apply(context, paras);
        }
      }
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
   * @example .emit('ok', data) may trigger function(event){ event.data;...}
   * @param {Event|Object|string} type
   * @param {*} data
   * @returns {self}
   */
  $pt.trigger = function(type, data) {
    ActionUtil.dispatch.apply(ActionUtil, [this, 'trigger', type, data]);

    return this;
  };

  /**
   * Dispatch custom event, handlers accept rest arguments.
   *
   * @example .emit('ok', a, b) may trigger function(a, b){...}
   * @param {Event|Object|string} type
   * @returns {self}
   */
  $pt.emit = function(type/*, ..rest*/) {
    var rest = [].slice.call(arguments, 1);
    ActionUtil.dispatch.apply(ActionUtil, [this, 'emit', type].concat(rest));

    return this;
  };

})(window);
