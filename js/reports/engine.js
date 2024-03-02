// =====================================================================================
// reports.js.engine
// =====================================================================================
(function (module) {

  var core   = module.core,
      pubsub = module.pubsub,
      ui     = module.ui
      templates = module.templates;

  var ReportEngine = (function () {

    function ReportEngine() {
      this.BS = {};
      this.copy = function (source, dest) {
        for (var p in dest) {
          if (dest.hasOwnProperty(p)) {
            if (source.hasOwnProperty(p)) {
              dest[p] = source[p];
              continue;
            }
            if (p === '_max_' || p === '_mim_') {
              var __max = dest[p];
              for (var m in __max) {
                if (__max.hasOwnProperty(m) && source.hasOwnProperty(m))
                    __max[m] = source[m];
              }
            }
            if (p === '_values_') {
              var __agregate = dest[p];
              for (var m in __agregate) {
                if (__agregate.hasOwnProperty(m) && source.hasOwnProperty(m)) 
                    __agregate[m] = [source[m]];
              }
            }
          }
        }
      };
      this.sum = function (source, dest) {
        for (var p in dest) {
          if (dest.hasOwnProperty(p)) {
            if (source.hasOwnProperty(p)) {
              dest[p] += source[p];
              continue;
            }
            if (p === '_max_' || p === '_min_') {
              var target = dest[p];
              for (var m in target) {
                if (target.hasOwnProperty(m) && source.hasOwnProperty(m)) {
                  if (p == '_max_')
                      target[m] = source[m] > target[m] ? source[m] : target[m];
                  else
                      target[m] = source[m] < target[m] ? source[m] : target[m];
                }
              }
            }
            if (p === '_values_') {
              var __agregate = dest[p];             
              for (var m in __agregate) {
                if (__agregate.hasOwnProperty(m) && source.hasOwnProperty(m))
                  __agregate[m].add(source[m]);
                //if(__agregate[m].length == 13) debugger;
              }
            }
          }
        }
      };
    }

    ReportEngine.prototype.cloneRowTemplate = function (e) {
      var row = e.cloneNode(true);
      var table = e.parentNode.parentNode;
      table.deleteRow(e.rowIndex);
      return row;
    };

    ReportEngine.prototype.fillTemplate = function (e, scope) {
      var elements = e.querySelectorAll('[xbind]').toArray();
      if (e.attributes.getNamedItem('xbind')) elements.push(e);
      elements.forEach(function (child) {

        if(child.attributes['xmerge']){
          // ============================================================================
          // Atributos que es necesario procesar. Ej: id="txt-{index}"
          // ============================================================================
          core.toArray(child.attributes)
              //.where({ value: /{[^{]+?}/g })                   // <----- optimizar esto
              .map(function (a) {               
                return a.value.includes('{') &&
                       (a.value = templates.merge(a.value, scope)); 
              });
          // ============================================================================
          // Nodos texto de este elemento
          // ============================================================================
          core.toArray(child.childNodes)
              //.where({ nodeType: 3 })                          // <----- optimizar esto
              //.where({ textContent: /{[^{]+?}/g })             // <----- optimizar esto
              .map(function (node) { 
                return node.nodeType == 3 &&
                       node.textContent.includes('{') &&
                       (node.textContent = templates.merge(node.textContent, scope, node)); 
              });       
        }

        // ============================================================================
        // Propiedades que establecer
        // ============================================================================
        String.trimValues(child.attributes
              .getNamedItem('xbind')
              .value
              .split(';'))
              .forEach(function (token) {
                if (token === '') return;
                // ====================================================================
                // Un solo parametro que debe ser una función.        window.setCss()
                // ====================================================================
                if (token.indexOf(':') < 0) {
                  var name = token.split('(')[0];
                  var fn   = core.getValue(name, scope);
                  var params = core.parseArguments(token, scope, [child]);
                  return fn.apply(scope, params);
                }
                // ====================================================================
                // Dos parámetros:                id: window.rafa() | innerHTM:nombre
                // ====================================================================
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
      });
      return e;
    };

    ReportEngine.prototype.mergeTemplate = function (template, sb, context, onGroupFooter) {
      var _this = this;
      if (template.forEach)
        return template.forEach(function (t, i) { _this.mergeTemplate(t.cloneNode(true), sb, context[i], onGroupFooter); });
      this.fillTemplate(template, { BS: this.BS });
      if (context.tag || context.tag == 'nofooter') return;
      sb.append(template.outerHTML.replace(/xbind="[^"]*"/g, ''));
      if (onGroupFooter) onGroupFooter(sb, context, this.BS);
    };

    ReportEngine.prototype.processAll = function (o) {
      var _this = this;
      var doc      = document.createDocumentFragment();
      var template = core.build('div', { innerHTML: o.ReportTemplate }, false);
      doc.appendChild(template);
      var tbody = doc.querySelector('tbody');
      o.DetailTemplate = this.cloneRowTemplate(doc.querySelector(o.DetailTemplateSelector));
      o.TotalTemplate  = this.cloneRowTemplate(doc.querySelector(o.TotalTemplateSelector));
      if (o.HideTotal) delete o.TotalTemplate;
      o.GroupsTemplates = [];
      o.GroupsTemplates = o.Grupos.map(function (g) { return _this.cloneRowTemplate(doc.querySelector(g.selector)); });
      var that = this;
      var _g_id = -1;
      function __DoHeaders() {
        o.Grupos.forEach(function (grupo, ii) {
          if (ii < _g_id) return;
          var g = o.Grupos[ii];
          if (g.header) {
            var __header = core.getValue(g.header, that)(g.current, g.name);
            if (__header != 'hidden;') {
              if (__header.text)
                _sb.append('<tr {0}>{1}</tr>'.format(__header.attributes, __header.text));
              else if (__header.row)
                tbody.appendChild(__header.row);
              else 
                _sb.append(__header);
            }
            if (o.RepeatHeadersAfter == ii) {
              o.RepeatHeaders.forEach(function (index) {
                if (index != '') _sb.append(o.Headers[index].html);
              });
            }
          }
        });
      }
      var _sb = core.createStringBuilder('');
      o.OnStart(o.DataSet);
      o.DataSet.forEach(function (r, i) {
        if (i == 0) __DoHeaders();
        o.OnRow(r);
        if (o.Grupos.every(function (g) { return g.test(r); })) {
          o.Grupos.forEach(function (g) { g.sum(r); });
        }
        else {
          o.Grupos.some(function (g, i) {
            if (!g.test(r)) {
              _g_id = i;
              var templates = o.GroupsTemplates.map(function (t) { return t; });
              templates.splice(0, i);
              templates.reverse();
              var groups = o.Grupos.map(function (g) { return g; });
              groups.splice(0, i);
              groups.reverse();
              _this.mergeTemplate(templates, _sb, groups, o.OnGroupFooter);
              o.Grupos.forEach(function (grupo, ii) {
                if (ii >= i) {
                    grupo.init(r);
                    _g_id = i;
                }
                else 
                    grupo.sum(r);
              });
              return true;
            }
            return false;
          });
          o.OnRowEnd(r);
          __DoHeaders();
        }
        if (o.HideDetail) return;
        _this.mergeTemplate(o.DetailTemplate.cloneNode(true), _sb, { name: 'detail' }, o.g);
        if(o.OnItemFooter) o.OnItemFooter(_sb, o.g, _this.BS);
      });
      if (o.DataSet.length > 0) {
          this.BS.previous = this.BS.data;
          var __templates = o.GroupsTemplates.map(function (t) { return t; });
          __templates.reverse();
          if (!o.HideTotal) __templates.push(o.TotalTemplate);
          var groups = o.Grupos.map(function (g) { return g; });
          groups.reverse();
          groups.push({ name: 'summary' });
          this.mergeTemplate(__templates, _sb, groups, o.OnGroupFooter);
      }
      return doc.querySelector(o.ReportTableSelector)
                .innerHTML
                .replace('<tbody>', '<tbody>' + _sb.value);
    };

    ReportEngine.prototype.generateReport = function (rd, data) {
        var __that = this;
        this.BS = { reportDefinition: rd };
        // ================================================================================================
        // Ordenar los datos
        // ================================================================================================
        if (rd.iteratefn) data.forEach(rd.iteratefn);
        if (rd.orderBy)   data.sortBy(rd.orderBy, false);
        // ================================================================================================
        // Inicializar los grupos
        // ================================================================================================
        var __summary = JSON.parse(rd.summary || '{}');
        function __createGroups() {
          return rd.groups
                   .where(function (g, i) { return i < rd.groups.length - 1; })
                   .map(function (g, i) {
                     return {
                       name      : 'G' + (i + 1),
                       selector  : '[group-locator-{0}]'.format(i),
                       key       : g.key,
                       tag       : g.tag || '',
                       current   : '',
                       header    : g.header,
                       data      : core.clone(__summary),
                       init      : function (value) {
                         var __k = value[this.key].toString();
                         var __BS_Name = __that.BS[this.name];
                         __BS_Name.all[__k] = __BS_Name.all[__k] || [];
                         __BS_Name.all[__k].push(value);
                         __BS_Name.recordCount = 1;
                         __that.copy(value, this.data);
                       },
                       sum: function (value) {
                         var __k = value[this.key].toString();
                         var __BS_Name = __that.BS[this.name];
                         __BS_Name.all[__k] = __BS_Name.all[__k] || [];
                         __BS_Name.all[__k].push(value);
                         __BS_Name.recordCount += 1;
                         __that.sum(value, this.data);
                       },
                       test: function (value) { return value[this.key] == this.current; }
                     };
                   }) || [];
        }
        // ================================================================================================
        // Inicializar el informe e imprimirlo
        // ================================================================================================
        var __wrapper = {
            DataSet                 : data,
            HideDetail              : rd.hideDetail == 'true' || false,
            HideTotal               : rd.groups.length == 0 || rd.hideTotal == 'true' || false,
            ReportTemplate          : rd.html,
            ReportTableSelector     : '[table-container-locator]',
            DetailTemplateSelector  : '[detail-locator]',
            TotalTemplateSelector   : rd.groups.length == 0 ? '' : '[group-locator-{0}]'.format(rd.groups.length - 1),
            Grupos                  : __createGroups(),
            OnGroupFooter           : rd.onGroupFooter,
            OnItemFooter            : rd.onItemFooter,
            Headers                 : rd.headers,
            RepeatHeaders           : (rd.repeatHeader || '').split(','),
            RepeatHeadersAfter      : rd.repeatHeaderAfter,
            OnRow: function (data) {
              __that.BS.recordCount += 1;
              __that.BS.previous = __that.BS.data || data;
              __that.BS.data = data;
              __wrapper.Grupos.forEach(function (g, i) { 
                //__that.BS[g.name].data = Object.create(g.data);
                __that.BS[g.name].data = core.clone(g.data);
              });
              __that.sum(data, __that.BS.G0);
              if (rd.onRowfn) rd.onRowfn(__that.BS);
            },
            OnStart: function (dataSet) {
              __that.BS = {
                  recordCount: 0,
                  G0: core.clone(__summary),
                  dataSet: dataSet,
                  reportDefinition: __that.BS.reportDefinition
              };
              __wrapper.Grupos.forEach(function (g, i) {
                  g.current = (dataSet && dataSet[0]) ? dataSet[0][g.key] : '';
                  __that.BS[g.name] = { recordCount: 0, all: {} };
              });
              if (rd.onStartfn) rd.onStartfn(__that.BS);
            },
            OnRowEnd: function (data) {
              __wrapper.Grupos
                       .forEach(function (g) { g.current = data[g.key]; });
              if (rd.onRowEndfn) rd.onRowEndfn(__that.BS);
            }
        };
        return this.processAll(__wrapper)
    };

    return ReportEngine;

  }());

  module.reports    = module.reports || {};
  module.reports.ReportEngine = ReportEngine;

}(window[___ROOT_API_NAME]));

//if(rd.context.renderMode && rd.context.renderMode === 'DOM'){
//  rd.dom_table = $.$('div', { innerHTML : rd.html } ).querySelector('table');
//  rd.dom_thead = rd.dom_table.querySelector('thead');
//  rd.dom_tbody = module.clearNodes(rd.dom_table.querySelector('tbody'));       
//}