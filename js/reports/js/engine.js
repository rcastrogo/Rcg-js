
// =====================================================================================
// reports.js.engine
// =====================================================================================
(function (module) {

  var core   = module.core,
      pubsub = module.pubsub,
      ui     = module.ui;


var ReportEngine = (function () {

    function ReportEngine() {
        this.BS = {};
    }

    ReportEngine.prototype.generateReport = function (rd, data, mediator) {
        var that = this;
        if (mediator.clear) mediator.clear();
        mediator.message({ type: 'report.begin' });
        var __rd = rd;
        // ===========================================================================================
        // Transformar los datos
        // ===========================================================================================
        var __dataSet = __rd.parseData ? __rd.parseData(__rd, data, mediator.message) : data;
        mediator.message({ type: 'report.log.message', text: 'Inicializando...' });
        // ===========================================================================================
        // Inicializar funciones para la generación de contenido personalizado
        // ===========================================================================================
        function __initContentProviders() {
          [__rd.sections, 
           __rd.details, 
           __rd.groups
          ].reduce(function (a, b) { return a.concat(b); }, [])
           .map(function (s) {
              if (s.valueProviderfn) {
                s.valueProvider = core.getValue(s.valueProviderfn, { BS: that.BS });
                delete s.valueProviderfn;
              }
              if (s.footerValueProviderfn) {
                s.footerValueProvider = core.getValue(s.footerValueProviderfn, { BS: that.BS });
                delete s.footerValueProviderfn;
              }
              if (s.headerValueProviderfn) {
                s.headerValueProvider = core.getValue(s.headerValueProviderfn, { BS: that.BS });
                delete s.headerValueProviderfn;
              }
          });
        }
        // ===================================================================================================
        // Generación de las secciones de cabecera de las agrupaciones
        // ===================================================================================================
        var __MERGE_AND_SEND = function (t, p) {
          p.BS = that.BS;
          mediator.send(t.format(p));
        };
        function __groupsHeaders() {
          __groups.forEach(function (g, ii) {
            if (ii < __breakIndex) return;
            mediator.message({ type: 'report.sections.group.header', value: g.id });
            if (g.definition.header) return __MERGE_AND_SEND(g.definition.header, g);
            if (g.definition.headerValueProvider) return mediator.send(g.definition.headerValueProvider(g));
          });
        }
        // ===================================================================================================
        // Generación de las secciones de resumen de las agrupaciones
        // ===================================================================================================
        function __groupsFooters(index) {
          var __gg = __groups.map(function (g) { return g; });
          if (index) __gg.splice(0, index);
          __gg.reverse().forEach(function (g) {
            mediator.message({ type: 'report.sections.group.footer', value: g.id });
            if (g.definition.footer) return __MERGE_AND_SEND(g.definition.footer, g);
            if (g.definition.footerValueProvider) return mediator.send(g.definition.footerValueProvider(g));
          });
        }
        // ====================================================================
        // Generación de las secciones de detalle
        // ====================================================================
        function __detailsSections() {
          __details.forEach(function (d) {
            mediator.message({ type: 'report.sections.detail', value: d.id });
            if (d.template) return __MERGE_AND_SEND(d.template, d);
            if (d.valueProvider) return mediator.send(d.valueProvider(d));
          });
        }
        // ====================================================================
        // Generación de las secciones de total general
        // ====================================================================
        function __grandTotalSections() {
          __totals.forEach(function (t) {
            mediator.message({ type: 'report.sections.total', value: t.id });
            if (t.template) return __MERGE_AND_SEND(t.template, t);
            if (t.valueProvider) return mediator.send(t.valueProvider(t));
          });
        }
        // ====================================================================
        // Generación de las secciones de cabecera del informe
        // ====================================================================
        function __reportHeaderSections() {
          __headers.forEach(function (t) {
            mediator.message({ type: 'report.sections.header', value: t });
            if (t.template) return __MERGE_AND_SEND(t.template, t);
            if (t.valueProvider) return mediator.send(t.valueProvider(t));
          });
        }
        // ====================================================================
        // Inicializar el objeto que sirve de acumulador
        // ====================================================================
        function __resolveSummaryObject() {
          var summary = JSON.parse(__rd.summary || '{}');
          if (__rd.onInitSummaryObject) return __rd.onInitSummaryObject(summary);
          return summary;
        }
        var __breakIndex = -1;
        var __summary = __resolveSummaryObject();
        var __headers = (__rd.sections || []).where({ type: 'header' });
        var __totals = (__rd.sections || []).where({ type: 'total' });
        var __footers = (__rd.sections || []).where({ type: 'footer' });
        var __details = __rd.details || [];
        var __groups = __rd.groups.map(function (g, i) {
          return { 
              name        : 'G' + (i + 1),
              id          : g.id,
              rd          : __rd,
              definition  : g,
              current     : '',
              data        : core.clone(__summary),
              init        : function (value) {
                var __k = value[this.definition.key].toString();
                var __Gx = that.BS[this.name];
                __Gx.all[__k] = __Gx.all[__k] || [];
                __Gx.all[__k].push(value);
                __Gx.recordCount = 1;
                if (this.__resume === false)
                    return;
                if (this.__resume) {
                    that.copy(value, this.data);
                    return;
                }
                if (this.__resume = Object.keys(this.data).length > 0)
                    that.copy(value, this.data);
              },
              sum: function (value) {
                var __k = value[this.definition.key].toString();
                var __Gx = that.BS[this.name];
                __Gx.all[__k] = __Gx.all[__k] || [];
                __Gx.all[__k].push(value);
                __Gx.recordCount += 1;
                if (this.__resume === false) return;
                that.sum(value, this.data);
              },
              test: function (value) {
                return value[this.definition.key] == this.current;
              } };
        }) || [];
        that.BS = { reportDefinition: __rd, mediator: mediator };
        // ==============================================================================================
        // Ordenar los datos
        // ==============================================================================================
        if (__rd.iteratefn) {
            mediator.message({ type: 'report.log.message', text: 'Inicializando elementos...' });
            __dataSet.forEach(__rd.iteratefn);
        }
        if (__rd.orderBy) {
            mediator.message({ type: 'report.log.message', text: 'Ordenando datos...' });
            __dataSet.sortBy(__rd.orderBy, false);
        }
        // ==============================================================================================
        // Inicializar
        // ==============================================================================================
        that.BS = { 
          recordCount: 0,
          G0                : core.clone(__summary),
          dataSet           : __dataSet,
          reportDefinition  : __rd,
          mediator          : mediator 
        };
        __groups.forEach(function (g, i) {
            g.current = (__dataSet && __dataSet[0]) ? __dataSet[0][g.definition.key] : '';
            that.BS[g.name] = { recordCount: 0, all: {} };
        });
        if (__rd.onStartfn) __rd.onStartfn(that.BS);
        __initContentProviders();
        mediator.message({ type: 'report.render.rows' });
        mediator.message({ type: 'report.log.message', text: 'Generando informe...' });
        // ==============================================================================
        // Cabeceras del informe
        // ==============================================================================
        __reportHeaderSections();
        // ==============================================================================
        // Cabeceras iniciales
        // ==============================================================================
        if (__dataSet.length > 0) __groupsHeaders();
        // ==============================================================================
        // Iterar sobre los elementos
        // ==============================================================================
        __dataSet.forEach(function (r, i) {
            that.BS.recordCount++;
            that.BS.isLastRow = __dataSet.length === that.BS.recordCount;
            that.BS.isLastRowInGroup = that.BS.isLastRow;
            that.BS.percent = (that.BS.recordCount / __dataSet.length) * 100;
            that.BS.previous = that.BS.data || r;
            that.BS.data = r;
            __groups.forEach(function (g, i) {
                that.BS[g.name].data = Object.create(g.data);
            });
            that.sum(r, that.BS.G0);
            if (__rd.onRowfn) __rd.onRowfn(that.BS);
            mediator.message({ type   : 'report.render.row',
                               text   : that.BS.percent.toFixed(1) + ' %',
                               value  : that.BS.percent });
            // ============================================================================
            // Determinar si hay cambio en alguna de las claves de agrupación
            // ============================================================================
            if (__groups.every(function (g) { return g.test(r); })) {
              __groups.forEach(function (g) { g.sum(r); });
            }
            else {
              __groups.some(function (g, i) {
                  if (!g.test(r)) {
                      __breakIndex = i;
                      // ============================================
                      // Pies de grupo de los que han cambiado
                      // ============================================
                      __groupsFooters(__breakIndex);
                      // ============================================
                      // Actualizar los grupos
                      // ============================================
                      __groups.forEach(function (grupo, ii) {
                          if (ii >= __breakIndex) {
                              // ========================================
                              // Inicializar los que han cambiado
                              // ========================================
                              grupo.init(r);
                              __breakIndex = i;
                          } else {
                              // ========================================
                              // Acumular valores de los que siguen igual
                              // ========================================
                              grupo.sum(r);
                          }
                      });
                      return true;
                  }
                  return false;
              });
              // ==========================================================
              // Notificar del evento onGroupChange
              // ==========================================================
              __groups.forEach(function (g) {
                  g.current = r[g.definition.key];
              });
              if (__rd.onGroupChangefn) __rd.onGroupChangefn(that.BS);
              mediator.message({ type   : 'report.sections.group.change',
                                 value  : __groups });
              // ==========================================================
              // Cabeceras
              // ==========================================================
              __groupsHeaders();
            }
            // ============================================================
            // Determinar si este es el último elemento de la agrupación 
            // ============================================================
            if (__groups.length && !that.BS.isLastRow) {
              var __next = __dataSet[that.BS.recordCount];
              that.BS.isLastRowInGroup = !__groups.every(function (g) {
                  var __k = g.definition.key;
                  return __next[__k] === that.BS.data[__k];
              });
            }
            // ============================================================
            // Secciones de detalle
            // ============================================================
            __detailsSections();
        });
        if (__dataSet.length > 0) {
            that.BS.previous = that.BS.data;
            // =============================
            // Pies de grupo
            // =============================
            __groupsFooters();
        }
        // ===================================================
        // Total general
        // ===================================================
        __grandTotalSections();
        mediator.message({ type: 'report.render.end' });
        mediator.message({ type: 'report.end' });
        return mediator.flush ? mediator.flush() : '';
    };
    ReportEngine.prototype.merge = function (template, o) {
      return template.replace(/{([^{]+)?}/g, function (m, key) {
          if (key.indexOf(':') > 0) {
              var fn = key.split(':');
              fn[0] = core.getValue(fn[0], o);
              fn[1] = core.getValue(fn[1], o);
              return fn[0](fn[1], o);
          }
          var r = core.getValue(key, o);
          return typeof (r) == 'function' ? r(o) : r;
      });
    };
    ReportEngine.prototype.copy = function (s, d) {
      Object.keys(d).map(function (k) { d[k] = s[k]; });
    };
    ReportEngine.prototype.sum = function (s, d) {
      Object.keys(d).map(function (k) { d[k] += s[k]; });
    };
    ReportEngine.prototype.compute = function (data, name) {
      if(core.isObject(name)){
        var props = Object.keys(name);
        return data.reduce(function(p, c, i, a){ 
          props.map(function(prop){
            var v = c[prop];
            var s = core.isString(p[prop]);
            p[prop] +=  s ? (v + ';') : v;  
          });
          return p;
        }, core.clone(name));
      }
      return data.reduce(function (t, o) { return t + o[name]; }, 0.0);
    };
    ReportEngine.prototype.group = function (data, c) {
      var ds = data;
      var fn = function (k, t) {
          ds.distinct(function (v) { return v[k]; })
            .forEach(function (v) { c[v] = ds.reduce(function (p, c, i, a) { return (c[k] == v) ? p + c[t] : p; }, 0.0); });
          return fn;
      };
      return fn;
    };
    ReportEngine.prototype.toGroupWrapper = function(data, ctx){
	    var dataSet = data;
	    var fn = function(k, t, name){
        ctx[name] = {};
        t = t.split(',');
	      dataSet.distinct( function(v){ return v[k]; })	            
	             .forEach ( function(v){
                 ctx[name][v] = dataSet.reduce( function(p, c, i, a){
                   if(c[k]!=v) return p;
                   if(!p.hasOwnProperty(t[0])){
                     var index = 0;
                     while(index < t.length){
                        p[t[index]] = c[t[index]], index++;
                     };                     
                   } else {
                     var index = 0;
                     while(index < t.length){
                        p[t[index]] += c[t[index]], index++;
                     };  
                   }
                   return p;
                 }, {});
               });
        return fn;	           
	    }
	    return fn;
	  }
    ReportEngine.prototype.createMediator = function(){ return new Mediator(); }

    // ====================================================
    // Receptor de mensajes
    // ====================================================
    function Mediator(){ this.buffer = []; }

    core.apply(Mediator.prototype, {
      send    : function(data){ this.buffer.push(data); },
      message : function(message){},
      flush   : function(){ return this.buffer.join(''); },
      clear   : function(){ this.buffer = []; return this; },       
    });

    return ReportEngine;

}());

  module.reports    = module.reports || {};
  module.reports.js = module.reports.js || {};
  module.reports.js.ReportEngine = ReportEngine;

}(window[___ROOT_API_NAME]));