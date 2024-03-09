
var ___ROOT_API_NAME = 'rcg';
window[___ROOT_API_NAME] = {};

// ==============================================================================================================
// core
// ==============================================================================================================
(function (module) {

    function Core() { }

    var core = module.core = new Core();

    Core.prototype.isNull = function (v) { return v === null; };
    Core.prototype.toArray = function (v) { return Array.from ? Array.from(v) : Array.prototype.slice.call(v); };
    Core.prototype.isArray = function (v) { return Array.isArray(v); };
    Core.prototype.isString = function (v) { return typeof v == 'string'; };
    Core.prototype.isBoolean = function (v) { return typeof v == 'boolean'; };
    Core.prototype.isNumber = function (v) { return typeof v == 'number'; };
    Core.prototype.isFunction = function (v) { return typeof v == 'function'; };
    Core.prototype.isDate = function(v){return Object.prototype.toString.call(v) === '[object Date]'},
    Core.prototype.isObject = function (v) { return v && typeof v == 'object'; };
    Core.prototype.apply = function (a, b, d) {
      if (d) core.apply(a, d);
      if (a && b && core.isObject(b)) {
        for (var p in b) {
          if (core.isArray(b[p]))       a[p] = core.clone(b[p]);
          else if (core.isObject(b[p])) core.apply(a[p] = a[p] || {}, b[p]);
          else                          a[p] = b[p];
        }
      }
      return a;
    };   
    Core.prototype.clone = function (o) {
      if(core.isDate(o))               return new Date(o.getTime());
      if (core.isArray(o))             return o.slice(0);
      if (core.isObject(o) && o.clone) return o.clone();
      if (core.isObject(o)) {
        return Object.keys(o).reduce(function (a, k) {
            a[k] = core.clone(o[k]);
            return a;
        }, {});
      }
      return o;
    };
    Core.prototype.createStringBuilder = function (s) {
      return { value: s || '', 
               append: function (s) { this.value = this.value + s; return this; },
               appendLine: function (s) { this.value = this.value + (s || '') + '\n'; return this; } };
    };
    Core.prototype.$ = function (e, control, def) {
        var element = document.getElementById(e);
        if (element) return element;
        var targets = control ? control.querySelectorAll(e) : document.querySelectorAll(e);
        if (targets.length) return targets.toArray();
        return def || null;
    };
    Core.prototype.element = function (idOrSelector, target) {
        return (document.getElementById(idOrSelector) || core.elements(idOrSelector, target)[0]);
    };
    Core.prototype.elements = function (selector, target) {
        return (target || document).querySelectorAll(selector).toArray();
    };
    Core.prototype.build = function (tagName, options, firstElementChild) {
        var o = core.isString(options) ? { innerHTML: options } : options;
        var e = core.apply(document.createElement(tagName), o);
        return firstElementChild ? e.firstElementChild : e;
    };   
    Core.prototype.wrapp = function(target){
      var that = this;
      return {
        css : function(value){
          if(arguments.length == 2)       target.style[value] = arguments[1];
          else if(that.isObject(value))   that.apply(target.style, value);
          return this;
        }
      };
    }
    Core.prototype.parseQueryString = function () {
        return location.search
                       .slice(1)
                       .split('&').reduce(function (o, a) {
                           o[a.split('=')[0]] = a.split('=')[1] || '';
                           return o;
                       }, {});
    };
    Core.prototype.config = function (name) {
      return {
        write: function (key, value) {
          localStorage.setItem('{0}.{1}'.format(name, key), value);
          return this;
        },
        read: function (key) {
          return localStorage.getItem('{0}.{1}'.format(name, key));
        }
      };
    };
    Core.prototype.getValue = function (key, scope, htmlElement) {
        if(key === 'this') return scope;
        var target = scope || self;
        var parts  = key.split('|'); // String.trimValues(key.split('|'));
        var tokens = parts.shift().split(/\.|\[|\]/).filter(function(t){ return t; });
        var last   = tokens.pop();
        var i      = 0;
        while(tokens.length){  
            i++;
            var propName = tokens.shift();
            if(propName in target) {
                target = target[propName];
                continue;
            }
            if(i > 1) {
                //throw Error('getVal error: {0} - {1}'.format(key, propName));
                console.log('Eror getValue: {0} - {1}'.format(key, propName));
                return '';
            }
            var value = undefined;
            // =============================================================================
            // Buscar la propiedad en un ambito superior si existe
            // =============================================================================
            if (target['#']) target = value = core.getValue(propName, target['#']);
            // =============================================================================
            // Buscar la propiedad en el contexto global
            // =============================================================================
            if (value === undefined && propName in self) target = value = self[propName];
            if(value === undefined){ 
                console.log('Eror getValue: {0} - {1}'.format(key, propName));
                return '';
            }
        }
        // =====================================================================================
        // Prototipo/función de transformación/formateo libro.name|htmlDecode,p1,p2,...|toString
        // =====================================================================================               
        if (parts.length > 0) { 
            return parts.reduce(function(acc, e){ 
                var arg  = e.split(',');// String.trimValues(e.split(','));            
                var name = arg[0];
                arg      = arg.slice(1);
                // ==================================================
                // Prototipo
                // ==================================================
                var fn = acc.__proto__[name];             
                if(fn) return fn.apply(acc, arg);
                // ==================================================
                // Función (window:Objeto:nombreFuncion,p0,p1,p2
                // ==================================================
                name = name.replace(/[\:>#]/g, '.');
                fn  = core.getValue(name, scope || self);
                arg = [acc, htmlElement].concat(arg);
                if(fn) return fn.apply(scope || self, arg);            
            }, target[last]);
        };
        return target[last];
    }
    Core.prototype.getValueOld = function (key, scope, ctx) {
      var target = (scope || self);
      if( target[key] != undefined) return target[key];
        return key.split(/\.|\[|\]/)
                  .reduce(function (a, b) {
                    if (b === '') return a;
                    if (b === 'this') return a;
                    var name = b;
                    // =====================================================
                    // Prototype libro.name|htmlDecode,p1,p2,...
                    // =====================================================
                    var apply_proto = b.indexOf('|') > -1;
                    var arg = [];
                    if (apply_proto) {
                        var tokens = String.trimValues(b.split('|'));
                        name = tokens[0];
                        arg = String.trimValues(tokens[1].split(','));
                    }
                    var value = a[name];
                    // =====================================================
                    // Buscar la propiedad en un ambito superior si existe
                    // =====================================================
                    if (value === undefined && a['#'])
                        value = core.getValue(name, a['#']);
                    // =====================================================
                    // Existe el valor. Se le aplica el prototipo si procede
                    // =====================================================
                    if (value != undefined) {
                        return apply_proto ? value.__proto__[arg[0]]
                                                  .apply(value, arg.slice(1))
                                           : value;
                    }
                    return a === self ? '' : self[name];
                  }, target);
    };
    Core.prototype.join = function (items, prop, separator) {
        return items.reduce(function (a, o) { 
                        var val = prop === '.' ? o : o[prop || 'id'];
                        return a.append(val); 
                    }, [])
                    .join(separator === undefined ? '-' : (separator || ''));
    };    
    Core.prototype.objectToArray = function(o){
        return core.toArray(Object.entries(o)).map( function(t) { return t[1]; });
    }
    Core.prototype.createGUID = function () {
      var dt = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    };
    Core.prototype.simpleSorter = function (p, des) {
      var ord = des ? -1 : 1;
      function comparer(a, b) { return ord * ((a < b) ? -1 : (a > b) ? 1 : 0); };
      var fn = (p && core.isFunction(p))
                ? function (a, b) { return comparer(p(a), p(b)); }
                : function (a, b) {
                    return comparer(p ? core.getValue(p, a) : a, p ? core.getValue(p, b) : b);
                };
      fn.type = 'core.sorter';
      return fn;
    };
    Core.prototype.multipleSorter = function (info) {
        var data = core.isArray(info) ? info : String.trimValues(info.split(','));
        var props = data.reduce(function (acc, t) {
            var tokens = core.isFunction(t) ? [t] : t.split(' ');
            var prop = {
                order  : (tokens[1] && (tokens[1].toUpperCase() == 'DESC')) ? -1 : 1,
                sorter : core.simpleSorter(tokens[0])
            };
            acc.push(prop);
            return acc;
        }, []);
        var ret = function (a, b) {
            var i = 0, l = props.length, f = props, fn = function (a, b) {
                var p = f[i];
                var v = p.sorter(a, b);
                if (v == -1) return p.order * -1;
                if (v == 1)  return p.order;
                i++;
                if (i < l) return fn(a, b);
                return 0;
            };
            return fn(a, b);
        };
        ret.type = 'core.sorter';
        return ret;
    };
    Core.prototype.parseArguments = function (token, o, base){
      var params = /\(([^)]+)\)/.exec(token);
      params     = params ? params[1].split(/\,/) : [];
      return String.trimValues(params)
                   .reduce( function (a, p) {
                      if(p.charAt(0) != '@') 
                        return a.append(p);                      
                      var name = p.slice(1)
                                  .replace(';', ','); // {0:window.ff(@id|toFixed;20)}
                      var val  = core.getValue(name, o);
                      return a.append(val); 
                   }, base || []);
    }

}(window[___ROOT_API_NAME]));
// ==============================================================================================================
// String.prototype
// ==============================================================================================================
(function(module){

  var core = module.core;

  String.trimValues = function (values) { return values.map(function (s) { return s.trim(); } ); };

  String.prototype.left = function(lenght) { return this.slice(0, lenght); };
  String.prototype.right = function(lenght){ return this.slice(-lenght); };
  String.prototype.replaceAll = String.prototype.replaceAll || function (pattern, replacement) { return this.split(pattern).join(replacement); };
  String.prototype.paddingLeft = function(value){ return (value + this).slice(-value.length); }
  String.prototype.toXmlDocument = function () { return new DOMParser().parseFromString(this, "text/xml"); };
  String.prototype.htmlDecode = function () { return new DOMParser().parseFromString(this, "text/html").documentElement.textContent; };
  String.prototype.format = function () {
    var args = core.toArray(arguments);
    var ctx  = args.lastItem() || window;
    return this.replace(/\{(\d+|[^{]+)\}/g, function (m, key) {       
      if (key.indexOf(':') > 0) {
        var tokens = key.split(':');
        var value  = /^\d+/.test(key) ? args[~~tokens[0]]              // {0:window.ff(1,2,3,@id|toFixed;20)}
                                      : core.getValue(tokens[0], ctx); // {des:window.ff(1,2,3,@id)}
        var name   = tokens[1].split('(')[0];
        var fn     = core.getValue(name, ctx);
        var params = core.parseArguments(tokens[1], ctx, [value]);
        params.push(ctx);
        return fn.apply(ctx, params);
      }      
      if (/^\d+/.test(key)){                                           // {1} {1|toFixed,2}
        tokens = key.split('|');
        var index  = ~~tokens[0];
        name = tokens.length == 0 ? 'data' : ['data'].concat(tokens.slice(1)).join('|');
        var scope  = { data : args[index], '#' : ctx };
        return core.getValue(name, scope);
      }           
      name  = key.split('(')[0];
      value = core.getValue(name, ctx);                                 // {des|toUpperCase}     
      if (core.isFunction(value)){                                      // {window.ff(1,2,3,@id)}
        params = core.parseArguments(key, ctx);
        params.push(ctx);
        return value.apply(ctx, params)
      }
      return value;
    });
  }
  String.prototype.$ = function(){
    var args = core.toArray(arguments);
    if(!args.length) return core.$(this.toString());
    var ref = args.lastItem();
    if(args.length == 1)
      return ref.tagName ? core.$(this.toString(), ref) : core.$(this.format.apply(this, args));
    else
      return ref.tagName ? core.$(this.format.apply(this, args.slice(0,-1)), ref) : core.$(this.format.apply(this, args));
  }
  String.prototype.toNumber = function(){
    return parseFloat(this);
  }
}(window[___ROOT_API_NAME]));
// ==============================================================================================================
// Array.prototype
// ==============================================================================================================
(function(module){

  var core = module.core;

  Array.prototype.item = function (prop, v, def) { return this.filter(function (i) { return i[prop] == v; })[0] || def; };
  Array.prototype.lastItem = function () { return this[this.length - 1]; };
  Array.prototype.remove = function (o) {
      var index = this.indexOf(o);
      if (index != -1) this.splice(index, 1);
      return this;
  };
  Array.prototype.add = function (o) {
      this.push(o);
      return o;
  };
  Array.prototype.append = function (o) {
      this.push(o);
      return this;
  };
  Array.prototype.where = function (sentence) {
      if (core.isFunction(sentence)) return this.filter(sentence);
      if (core.isObject(sentence)) {
        var fnBody = Object.keys(sentence)
                           .reduce(function (a, propname, i) {
                              return a + (i > 0 ? ' && ' : '')
                                       + (function () {
                                            var val = sentence[propname];
                                            if (val instanceof RegExp)
                                                return '{1}.test(a.{0})'.format(propname, val);
                                            if (core.isString(val))
                                                return 'a.{0} === \'{1}\''.format(propname, val);
                                            return 'a.{0} === {1}'.format(propname, val);
                                          }());
                           }, 'return ')
        return this.filter(new Function('a', fnBody));
      }
      return this;
  };
  Array.prototype.toDictionary = function (prop, value) {
    var fn = core.isFunction(prop);
    return this.reduce(function (a, d) {
        var key = fn ? prop(d) : d[prop || 'id'];
        a[key] = value ? d[value] : d;    
        return a;
    }, {})
  };
  Array.prototype.groupBy = function (props) {
    var keyParts = core.isArray(props) ? props : props.split(',');
    var buildKey = function (target) { 
        return keyParts.map(function (p) { 
                              var part = core.isFunction(p) ? p(target) : target[p];
                              return String(part).trim(); 
                            }).join('__'); 
    };
    return this.reduce(function (groups, item) {
        var key = buildKey(item);
        (groups[key] = groups[key] || []).push(item);
        return groups;
    }, {});
  };
  Array.prototype.distinct = function (sentence) {
    var fn = core.isFunction(sentence) ? sentence : function (a) { return sentence ? a[sentence] : a; };
    var r = [];
    this.forEach(function (item) {
      var val = fn(item);
      if (r.indexOf(val) == -1) r.push(val);
    });
    return r;
  };
  Array.prototype.sortBy = function (properties, desc) {
    if(properties && properties.type == 'core.sorter'){
         this.sort(properties);
         return this;
    }
    var order = [];
    var parts = (core.isArray(properties) ? properties : properties.split(','))
                  .map(function (token, i) {
                      var pair = token.split(' ');
                      order[i] = (pair[1] && (pair[1].toUpperCase() == 'DESC')) ? -1 : 1;
                      return pair[0];
                  });
    if(desc != undefined) order[0] = (desc ? -1 : 1);
    this.sort(function (a, b) {
      var i = 0;
      var fn = function (a, b) {
          var aa = a[parts[i]];
          var bb = b[parts[i]];
          if (aa < bb) return -1 * order[i];
          if (aa > bb) return 1 * order[i];
          i++;
          if (i < parts.length)
              return fn(a, b);
          return 0;
      };
      return fn(a, b);
    });
    return this;
  };
  Array.prototype.orderBy = function (sentence) {
    if(sentence && sentence.type == 'core.sorter'){
         return this.map(function (e) { return e; })
                    .sort(sentence);
    }
    var fn = core.isFunction(sentence) ? sentence : function (a) { return sentence ? a[sentence] : a };
    return this.map(function (e) { return e; })
               .sort(function (a, b) {
                  var x = fn(a);
                  var y = fn(b);
                  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
               });
  };
  Array.prototype.split = function (size) {
    return this.reduce((acc, item, i) => { 
      var chunk = Math.floor(i/size);
      if(!acc[chunk]) acc[chunk] = [];
      acc[chunk].push(item)
      return acc
    }, [])
  };

}(window[___ROOT_API_NAME]));
// ===================================================================================================================
// NodeList.prototype, NamedNodeMap.prototype
// ===================================================================================================================
NodeList.prototype.toArray     = 
NamedNodeMap.prototype.toArray = function () { return Array.from ? Array.from(this) : Array.prototype.slice.call(this); };
// ===================================================================================================================
// Date.prototype
// ===================================================================================================================
(function(module){
  module.core.apply(Date.prototype, {
    format: function (fmt) {
      if (fmt == 'yyyymmdd') {
        return '{2|paddingLeft,0000}/{1|paddingLeft,00}/{0|paddingLeft,00}'.format(
                  this.getDate().toString(),
                  (this.getMonth() + 1).toString(),
                  this.getFullYear().toString());
      }
      return '{0|paddingLeft,00}/{1|paddingLeft,00}/{2|paddingLeft,0000}'.format(
                this.getDate().toString(),
                (this.getMonth() + 1).toString(),
                this.getFullYear().toString());
    }
  });
})(window[___ROOT_API_NAME]);
// ==============================================================================================================
// templates
// ==============================================================================================================
(function (module) {
  
    var core = module.core;

    function merge(template, o, ctx) {
      return template.replace(/{([^{]+)?}/g, function (m, key) {
        
        if (key.indexOf(':') > 0) {             // {des:window.ff(1,2,3,@id)}
          var tokens = key.split(':');
          var value  = core.getValue(tokens[0], o);
          var name   = tokens[1].split('(')[0];
          var fn     = core.getValue(name, o);
          var params = core.parseArguments(tokens[1], o, [value]);
          params.push(ctx);
          return fn.apply(o, params);
        }
        name   = key.split('(')[0];             // {des|toUpperCase} 
        value  = core.getValue(name, o);        // {window.ff(1,2,3,@id)}
        if (core.isFunction(value)){
          params = core.parseArguments(key, o);
          params.push(ctx);
          return value.apply(o, params)
        }
        return value;
      });
    } 
    function fillTemplate(e, scope, clear) { 
      var root = core.isString(e) ? core.$(e) : e;
      // ======================================================================
      // Elementos en este nivel
      // ======================================================================
      var repeaters = root.querySelectorAll('[data-xfor]')
                          .toArray()
                          .reduce( function (acc, repeater) {
                              var parent = repeater.parentNode;
                              while (parent && parent != root) {
                                if (parent.attributes['data-xfor']) return acc;
                                parent = parent.parentNode;
                              }
                              acc.push(repeater);
                              return acc;
                          }, []);
      var repeatersElements = repeaters.reduce(function (a, rep) {
          var childs = rep.querySelectorAll('[data-xbind]').toArray();
          return a.concat(childs);
      }, repeaters.slice(0));
      var elements = root.querySelectorAll('[data-xbind], [data-xif]')
                         .toArray()
                         .where( function (e) { 
                           return !repeatersElements.includes(e); 
                         });
      if (root.attributes['data-xbind']) elements.push(root);
      // ======================================================================
      // Procesado de los elementos
      // ======================================================================
      elements.forEach(function (child, i) {
        // ====================================================================
        // Visibilidad del elemento. Ej: data-xif="index"
        // ====================================================================
        var xif = child.attributes['data-xif'];
        if(xif){
          var clause = xif.value.replace(/@/g, 'ctx.');
          var fn = new Function('ctx', 'return {0};'.format(clause));
          child.style.display = fn.apply(scope, [scope]) ? '' : 'none';
        }
        // ====================================================================
        // Atributos que es necesario procesar. Ej: id="txt-{index}"
        // ====================================================================
        child.attributes.toArray().map(function (a) { 
          if (/{[^{]+?}/g.test(a.value)) a.value = merge(a.value, scope);
        });
        // ====================================================================
        // Nodos texto de este elemento
        // ====================================================================
        child.childNodes.toArray().map(function(e){
          if(e.nodeType && e.nodeType == 3){
            var text = e.textContent;
            if (/{[^{]+?}/g.test(text)) e.textContent = merge(text, scope, e);
          }
        });
        // ====================================================================
        // Propiedades que establecer
        // ====================================================================
        var xbind = child.attributes['data-xbind'];
        xbind = xbind ? xbind.value.split(';') : [];
        String.trimValues(xbind).map(function(token) {
          if (token === '') return;
          // ==================================================================
          // Un solo parametro que debe ser una función.        window.setCss()
          // ==================================================================
          if (token.indexOf(':') < 0) {
            var name = token.split('(')[0];
            var fn   = core.getValue(name, scope);
            var params = core.parseArguments(token, scope, [child]);
            return fn.apply(scope, params);
          }
          // ==================================================================
          // Dos parámetros:                id: window.rafa() | innerHTM:nombre
          // ==================================================================
          var tokens    = token.split(':');
          var propName  = tokens[0];
          var valueName = tokens[1].split('(')[0];
          var propValue = core.getValue(valueName, scope);
          if (core.isFunction(propValue)) {
            var params = core.parseArguments(tokens[1], scope, [child]); 
            propValue = propValue.apply(scope, params);
          }
          child[propName] = propValue;
        });
        if(clear){
          child.removeAttribute("data-xbind");
          child.removeAttribute("data-xfor");
          child.removeAttribute("data-xif");
        }
      });

      // ======================================================================================
      // Procesado de los repeaters
      // ======================================================================================
      repeaters.map(function (repeater) {
        var tuple    = String.trimValues(repeater.attributes['data-xfor'].value.split(' in '));
        var itemName = tuple[0];
        var propName = tuple[1];
        var values   = core.getValue(propName, scope);
        if (values && values != window) {
          values.map(function (d, i) {
            var new_scope = { index : i, '#' : scope };
            new_scope[itemName] = core.clone(d);
            var node = fillTemplate(repeater.cloneNode(true), new_scope, clear);
            repeater.parentNode.insertBefore(node, repeater);
          });
        }
        return repeater.parentNode.removeChild(repeater);
      });

      return e;
    }
    function executeTemplate(e, values, dom) {
        var template = core.isString(e) ? core.$(e) : e;
        var result   = values.reduce(function (acc, v, i) {
                                       v.index  = i;
                                       var node = { 
                                         index : i,
                                         data  : v, 
                                         node  : fillTemplate(template.cloneNode(true), v, false) 
                                       };
                                       core.$('[data-xbind], [data-xfor], [data-xif]', node.node)
                                           .forEach( function(e){
                                                e.removeAttribute("data-xbind");
                                                e.removeAttribute("data-xfor");
                                                e.removeAttribute("data-xif");
                                           });
                                       acc.nodes.push(node);
                                       if (!dom) acc.html.push(node.node.outerHTML);
                                       return acc;
                                     }, 
                                     { nodes: [], html: [] });
        return dom ? result.nodes : result.html.join('');
    }
    
    module.templates = {
      merge           : merge,
      fillTemplate    : fillTemplate,
      executeTemplate : executeTemplate
    }

  }(window[___ROOT_API_NAME]));
// ====================================================================================
// events
// ====================================================================================  
(function (module) {
    var counter = 0;
    function Event(name) {
        this.name = name;
        this.subscribers = new Map();
    }
    Event.prototype.dispatch = function (eventArgs) {
        var that = this;
        this.subscribers
            .forEach(function (callback) { return callback(that.name, eventArgs); });
        return this;
    };
    Event.prototype.add = function (callback) {
        this.subscribers.set(++counter, callback);
        return counter;
    };
    Event.prototype.remove = function (id) { return this.subscribers.delete(id); };
    module.events = {
      Event : Event
    }
}(window[___ROOT_API_NAME]));
// ===================================================================
// pupsub
// ===================================================================
(function(module){

  (function(module) {
    var topics = {}, id = -1;
    module.subscribe = function(topic, func) {
      if (!topics[topic]) topics[topic] = [];
      var token = (++id).toString();
      topics[topic].push({ token : token, func : func });
      return token;
    };
    module.publish = function(topic, args, ctx) {
      if (!topics[topic]) return false;
      setTimeout(function() {
          var subscribers = topics[topic];
          var len = subscribers ? subscribers.length : 0;
          while (len--) {              
              subscribers[len].func.call((ctx || this), topic, args);
          }
      }, 0);
      return true;
    };
    module.unsubscribe = function(token) {
      for (var m in topics) {
        if (topics[m]) {
          for (var i = 0, j = topics[m].length; i < j; i++) {
              if (topics[m][i].token === token) {
                  topics[m].splice(i, 1);
                  return token;
              }
          }
        }
      }
      return false;
    };
    module.TOPICS = { 
      WINDOW_SCROLL : 'msg//window//scroll', 
      WINDOW_RESIZE : 'msg//window//resize',
      VALUE_CHANGED : 'msg//value//changed'
    };
  }(module.pubsub = { }));

}(window[___ROOT_API_NAME]));
// =========================================================================
// core.include
// =========================================================================
(function(module){ 
  var includes = [];
  module.core.include = function(url, preserve){
    return new Promise( function(resolve){
      function __resolve() {
        if(preserve === undefined || preserve) includes.push(url.toLowerCase());
        resolve();
      }
      if(includes.indexOf(url.toLowerCase())>-1){
        resolve();
        return;
      }
      var script = module.core.build('script', { type : 'text/javascript' })
      if (script.readyState){  
        script.onreadystatechange = function(){
          if(script.readyState=='loaded'||script.readyState=='complete'){
            script.onreadystatechange = null;
            __resolve();
          }
        };
      } else{ script.onload = function(){ __resolve(); };}
      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);   
    });
  }
}(window[___ROOT_API_NAME]));
  // =================================================================================================
  // Ajax
  // =================================================================================================
(function(module){  
    module.ajax = {};
    module.core.apply(module.ajax, {
      get  : function (url, interceptor) {
        return new Promise( function(resolve, reject){
          var xml = module.ajax.createXMLHttpRequest();
          xml.open('GET', url, true);
          if(interceptor) interceptor(xml);		  
          xml.onreadystatechange = function () { 
            if (xml.readyState == 4) resolve(xml.responseText)
          };
          xml.onerror = function(e) { reject(e); };
          xml.send(null);
        });
      },
      post : function(url, params, interceptor) {
        return new Promise( function(resolve, reject){
          var xml = module.ajax.createXMLHttpRequest();
          xml.open('POST', url, true);
          if(interceptor) {
            interceptor(xml);
          } else {
            xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset:ISO-8859-1');
          }
          xml.onreadystatechange = function() { if (xml.readyState == 4) resolve(xml.responseText) };
          xml.onerror = function(e) { reject(e); };
          xml.send(params);        
        });
      },
      postJson : function(url, params, interceptor) {
        return new Promise( function(resolve, reject){
          var xml = module.ajax.createXMLHttpRequest();
          xml.open('POST', url, true);
          xml.onreadystatechange = function(){ if (xml.readyState == 4) resolve(xml.responseText) };
          xml.setRequestHeader('Content-type', 'application/json; charset=utf-8');
          xml.onerror = function(e) { reject(e); };
          xml.send(params);
        });
      },
      createXMLHttpRequest : function(){ return new XMLHttpRequest(); }
    });  
}(window[___ROOT_API_NAME]));
// =======================================================================================
// CommandManager
// =======================================================================================
(function(module){  

  function CommandManager(doc){
    var cm = { 
      undos : [],
      redos : [],
      clear         : function() { cm.undos.length = cm.redos.length = 0; },
      executeCommad : function(command){
        try{
          cm.undos.push(command.execute(doc));
          cm.redos.length = 0;
        } catch(e){ console.error(e) }
      },
      undo : function(){ if(cm.undos.length) cm.redos.push(cm.undos.pop().undo(doc)); },
      redo : function(){ if(cm.redos.length) cm.undos.push(cm.redos.pop().execute(doc)); }
    };  
    return cm;
  };
  module.commands = {
    CommandManager : CommandManager
  }

}(window[___ROOT_API_NAME]));
// ================================ 
// StateManager
// ================================
(function(module){

  function StateManager(){
    var sm = {
      state    : {},
      enter    : {},
      idle     : {},
      leave    : {},
      setState : function(name, o){
        sm.state = sm[name];  
        sm.state.activate(o);
      }    
    }
    return sm;
  }

  function StateManagerV2(names){
    var sm = {
      controllers : {},
      current     : {},
      setState : function (name, o) {
        if(sm.current != sm.controllers[name]){
          if(sm.current.unLoad) sm.current.unLoad(o);        
          sm.current = sm.controllers[name];
          sm.current.load(o);   
        }
      }
    };
    names.forEach(function(n){
      sm.controllers[n] = { id     : n, 
                            load   : function(o){}, 
                            unLoad : function(o){} }});
    return sm;
  }  

  module.states = {
    StateManager : StateManager
  };

}(window[___ROOT_API_NAME]));

// =====================================================================
// ui.Paginator
// =====================================================================
(function (module) {
  module.ui = module.ui || {};
  function paginate(data, currentPage, pageSize, title) {
    if (currentPage === undefined) { currentPage = 1; }
    if (pageSize === undefined) { pageSize = 10; }
    var totalPages = Math.ceil(data.length / pageSize);
    if (currentPage < 1) {
        currentPage = 1;
    }
    else if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize - 1, data.length - 1);
    return { 
      totalItems   : data.length,
      currentPage  : currentPage,
      pageSize     : pageSize,
      totalPages   : totalPages,
      startIndex   : startIndex,
      endIndex     : endIndex,
      allItems     : data,
      visibleItems : data.slice(startIndex, endIndex + 1),
      title        : title,
      getCheckeds  : function () { 
        return data.where({ '__checked': true })
                   .map(function (item, i) {
                      return { index: data.indexOf(item), item: item };
                   }); 
      }
    };
  };
  module.ui.paginate = paginate 

}(window[___ROOT_API_NAME]));
// =====================================================
// ui.debounce
// =====================================================
(function (module) {
  module.ui = module.ui || {};
  module.ui.debounce = function(func, wait, immediate) {
	  var timeout;
	  return function() {
		  var context = this, args = arguments;
		  var later = function() {
			  timeout = null;
			  if (!immediate) func.apply(context, args);
		  };
		  var callNow = immediate && !timeout;
		  clearTimeout(timeout);
		  timeout = setTimeout(later, wait);
		  if (callNow) func.apply(context, args);
	  };
  };    
}(window[___ROOT_API_NAME]));
// ==========================================================================
// ui.addEventListeners
// ==========================================================================
(function (module) {
  var core   = module.core;
  var pubsub = module.pubsub;
  var EVENTS = ['[on-click]', '[on-publish]', '[route-link]', '[on-change]'];
  var _fn = {
      innerHTML: function (e, value, mode) { return e.innerHTML = value; },
      innerText: function (e, value, mode) { return e.innerText = value; },
      className: function (e, value) { return e.className = value; },
      append: function (e, value, mode) { return e.innerHTML += value; },
  };
  module.ui = module.ui || {};
  function addEventListeners(container, handlers, context) {

    EVENTS.forEach(function (selector, index) {
      container
        .querySelectorAll(selector)
        .toArray()
        .concat([container])
        .forEach(function (e) {
          var name = selector.replace('[', '').replace(']', '');
          if (!e.attributes.getNamedItem(name)) return;
          var value = e.attributes.getNamedItem(name).value;
          // =============================================================
          // [on-click]
          // =============================================================
          if (index === 0) { 
            e.onclick = function (event) {
              var name = value.split('(')[0];
              var params = core.parseArguments(value, context, []);
              var fn = handlers[name] || core.getValue(name, context);
              return fn.apply(context, [e, event].concat(params));
            };
            return;
          }
          // =================================================================================
          '[on-publish]'
          // =================================================================================
          if (index === 1) {
            var tokens = value.split(':');
            var topic = core.getValue(tokens[0], context) || 
                        core.getValue(tokens[0], pubsub)  ||
                        tokens[0];
            pubsub.subscribe(topic, function (message, data) {
              var fnName = tokens[1].split('(')[0];
              if (fnName) {
                  var fn = _fn[fnName] || handlers[fnName] || core.getValue(fnName, context);
                  if(fn){
                    var params = core.parseArguments(tokens[1], context, []);
                    fn.apply(context, [e, data].concat(params));
                  }
                  return;
              }
              else 
                  _fn.innerHTML(e, data, tokens[1]);
            });
          }
          // =================================================================================
          '[route-link]'
          // =================================================================================
          if (index === 2) {
            e.onclick = function (e) { 
              //let router = context.router;
              //let route = router.normalizePath(e.target.href);
              //if (router.current != route) {
              //  try {
              //    router.navigateTo(route);
              //  } catch (error) {
              //    console.log(error);
              //  }
              //}
              return false;
            };
          }
          // =========================================================================================
          '[on-change]'
          // =========================================================================================
          if (index === 3) {
            var tokens = value.split(':');
            var topic = tokens[1] || pubsub.TOPICS.VALUE_CHANGED;
            var select = e.tagName === 'SELECT';
            if (tokens[0] === 'publish') {
              if (select)
                  e.onchange = function () { return pubsub.publish(topic, e); };
              else
                  e.oninput = module.ui.debounce(
                                function () { return pubsub.publish(topic, e); },
                                350
                              );
              return;
            }
            var name = value.split('(')[0];
            var params = core.parseArguments(value, context, [e]);
            var fn = handlers[name] || core.getValue(name, context);            
            if (select)
              e.onchange = function () { return fn.apply(context, params); };
            else
              e.oninput = module.ui.debounce(
                            function () { return fn.apply(context, params); }, 
                            350
                          );
            //e.onblur = function () { return fn.apply(context, params); };
          }
        });
      });
  }
  module.ui.addEventListeners = addEventListeners;
}(window[___ROOT_API_NAME]));
