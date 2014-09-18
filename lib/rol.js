/*
 * rol
 * https://github.com/sackio/rol
 *
 * Copyright (c) 2014 Ben Sack
 * Licensed under the MIT license.
 */

'use strict';

(function(){

  /*
    Rol works by wrapping an object with methods for controlling access to the object's
    methods and properties

    A Rol object includes rules, an array of methods that are called to mediate access to the wrapped object.
    Rules are applied in series, using an optional selector to apply the rule selectively. Rules include
    handlers which can mediate, redirect, or prevent access to the underlying object's method/property.

    Rule handlers are passed an access object, which represents the access level to use
    during rule evaluation. Handlers are also passed the method obj, which contains the method name and
    arguments, all of which can be mutated by any handler.

    Rule handlers ultimately return a value (if synchronous) or pass a result to a callback. If handlers
    return or pass an error, the access attempt is aborted and this error is returned to the original caller or
    passed to the original callback -- thus providing powerful and granular access control.

    Once wrapped, an object inherits a rol property, which acts as the access control method. 

    Synchronous example:

    //original method
    var result = obj.someMethod(1, 2, 3);

    //with access control
    var result = obj.rol({user: 'admin'}, 'someMethod', [1, 2, 3]);


  */
  var Rol = function(){
    var R = {};
    R.prototype = {};

    /*
      Array of rules used for access control and mediation
        Rules are applied in index order
    */
    R.rules = [
    /*
      //apply a mediating rule if selector returns true
      {
        label: optional name for rule

      , selector: string | regexp | function(method, args, access, options, rol, cb)
                      string - if method is equal to string selector returns true
                      regexp - if method matches regexp selector returns true
                      function - the wrapped object is bound as this, if function returns true, selector returns true
                      *selectors are synchronous by default.
                       Passing options.async causes selector to be evaluated asynchronously, with cb being passed (error, result)
                      *method may be a property, in which case args is ignored

      , handler: function(acObj, method, args, cb, options, rol)
                 *function is called with the wrapped object bound as this.
                 acObj - the access object being evaluated against the hander
                 method - a string with the name of the method or property
                 args - the arguments being called with the method. These are passed by reference and are mutable at each rule step.
                   *if method is a property, args is null
                 cb - the callback passed (error, result) to evaluate the handler (if handler is async)
                 options - optional options object. Handlers are async by default. Passing sync will cause handlers to be evaluated synchronously
                 rol - the Rol object being used
      }

      //apply a mediating rule to all methods
    , function(acObj, method, args, cb, options, rol)
    */
    ];

    /*

    */
    R.prototype._asyncSeries = function(list, iter, cb, index){
      var self = this;

      if (!index) index = 0;

      if (index >= list.length) return cb();

      return iter(list[index], function(err){
        if (err) return cb(err);

        return self._asyncSeries(list, iter, cb, index + 1);
      });
    };

    R.prototype._values = function(obj){
      var vals = [];
      for (k in obj){
        vals.push(obj[k]);
      }
      return vals;
    };

    R.prototype._make_async = function(func, cb){
      return function(){
        var val = func.apply(this, arguments);
        return cb(val instanceof Error ? val : null
                 , val instanceof Error ? null : val);
      };
    };

    //this object is the object being mediated
    R.mediate = function(rule, acObj, method, med_args, orig_args, rol){
      
    };

    R.wrap = function(obj){
      obj.rol = new R();
      return obj;
    }

    R.rol = function(obj, access, method){
      var args = R.values(arguments);



    };

    return R;
  };

  if (typeof module !== 'undefined'){ module.exports = new Rol(); } //server
  else { this.Rol = new Rol(); }

}).call(this);
