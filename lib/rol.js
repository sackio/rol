/*
 * rol
 * https://github.com/sackio/rol
 *
 * Copyright (c) 2014 Ben Sack
 * Licensed under the MIT license.
 */

(function(){
  var Rol = function(){
    var R = function(acObj, method, args, options){
      var a = {
        'acObj': acObj || {}
      , 'methObj': {
          'method': method || ''
        , 'args': args || []
        }
      , 'o': options || {}
      , 'self': this
      };
      var l_a = a.methObj.args[a.methObj.args.length - 1];
      a.o.cb = a.o.cb || (l_a instanceof Function ? l_a : undefined);
      a.o.async = a.o.async || (typeof a.o.cb !== 'undefined');
      a.o.sync = a.o.sync || !a.o.async;

      if (a.o.sync){
        var rval, r;
        for (var i = 0; i < R.rules.length; i++){
          r = R.rules[i];
          if (!r) continue;

          if (!(r instanceof Function)){
            if (!r.handler) continue;

            if (typeof r.selector === 'string' && r.selector !== a.methObj.method) continue;
            if (r.selector instanceof RegExp && !a.methObj.method.match(r.selector)) continue;
            if (r.selector instanceof Function && !r.selector.apply(a.self, [a.methObj.method, a.methObj.args])) continue;

            r = r.handler;
          }

          rval = r.apply(a.self, [a.acObj, a.methObj]);
          if (rval) break;
        }
        return rval ? rval : a.self[a.methObj.method].apply(a.self, a.methObj.args);
      } else {
        return R._asyncSeries(R.rules, function(r, cb){
          if (!r) return cb();

          if (!(r instanceof Function)){
            if (!r.handler) return cb();

            if (typeof r.selector === 'string' && r.selector !== a.methObj.method) return cb();
            if (r.selector instanceof RegExp && !a.methObj.method.match(r.selector)) return cb();
            if (r.selector instanceof Function && !r.selector.apply(a.self, [a.methObj.method, a.methObj.args])) return cb();

            r = r.handler;
          }

          return r.apply(a.self, [a.acObj, a.methObj, cb]);
        }, function(){
          if (arguments.length > 0) return a.cb ? a.cb(arguments) : arguments;

          return a.self[a.methObj.method].apply(a.self, a.methObj.args);
        });
      }
    };

    /*
      Synchronous version of rol
    */
    R['rolSync'] = function(acObj, method, args, options){
      var o = options || {};
      o.async = false;
      o.sync = true;

      return R(acObj, method, args, o);
    };

    /*
      Asynchronous version of rol
    */
    R['rolAsync'] = function(acObj, method, args, options){
      var o = options || {};
      o.async = true;
      o.sync = false;

      return R(acObj, method, args, o);
    };

    /*
      Add a rule to the rules array
    */
    R['addRule'] = function(rule, index){
      if (index === undefined){
        R.rules.push(rule);
      } else {
        R.rules.splice(index, 0, rule);
      }
      return R;
    };

    /*
      Remove a rule from the rules array
    */
    R['removeRule'] = function(label){
      if (typeof label === 'number'){
        R.rules.splice(label, 1);
      } else if (typeof label === 'string'){
        for (var i = 0; i < R.rules.length; i++){
          if (R.rules[i].label && R.rules[i].label === label)
            R.rules.splice(i, 1);
        }
      } else if (label instanceof RegExp){
        for (var j = 0; j < R.rules.length; j++){
          if (R.rules[j].label && R.rules[j].label.match(label))
            R.rules.splice(j, 1);
        }
      }
      return R;
    };

    /*
      Array of rules used for access control and mediation
    */
    R['rules'] = [];

    /*
      Execute functions in series, aborting when any arguments are passed to the callback
    */
    R['_asyncSeries'] = function(list, iter, cb, index){
      var self = this;

      if (!index) index = 0;

      if (index >= list.length) return cb();

      return iter(list[index], function(){
        if (arguments.length > 0) return cb.apply(self, arguments);

        return self._asyncSeries(list, iter, cb, index + 1);
      }, index);
    };

    /*
      Wrap an object with Rol - R becomes accessible from obj.rol
    */
    R['wrap'] = function(obj, options){
      var o = options || {};
      obj[o.prefix || 'rol'] = this.bind(obj);
      return this;
    };

    return R;
  };

  if (typeof module !== 'undefined'){ module.exports = new Rol(); } //server
  else { this.Rol = new Rol(); }

}).call(this);
