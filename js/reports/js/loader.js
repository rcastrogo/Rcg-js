
// =====================================================================================
// reports.js.loader
// =====================================================================================
(function (module) {

  var core   = module.core;
  var pubsub = module.pubsub;
  var ui     = module.ui;

  function loadReport(code) {

    if(arguments.length == 2) 
      return loadFromHTMLElement(arguments[0], arguments[1]);

    var context = {
          sections: [],
          groups: [],
          details: [] 
        },
        cur = {},
        func = '',
        funcBody = '',
        setState = false;

    function get(value) {
      if (value && value.trim().startsWith('@')) {
          return context[value.trim().split('@')[1].trim()] || '';
      }
      else if (value) {
          return value.trim();
      }
      return '';
    }

    function parse_properties(value) {
      var reg = /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
      var o = {};
      var match = reg.exec(value);
      while (match != null) {
          o[match[1].trim()] = get(match[2].trim().replace(/^'([^']*)'$/g, '$1'));
          match = reg.exec(value);
      }
      return o;
    }

    function parseLine(l, o) {
      var tokens;
      if (!func && !l.trim())
          return function () { };
      var keys = /DEFINE|#|CREATE|SET|FUNCTION|END/;
      if (keys.test(l)) {
        if (/^#/.test(l)) {
          return function () { };
        }
        else if (/^SET (\w.*)/.test(l)) {
          tokens = l.match(/^SET (\w.*)$/);
          setState = true;
          func = tokens[1].trim();
          funcBody = '';
          return function () { };
        }
        else if (/^FUNCTION (\w.*)/.test(l)) {
          tokens = l.match(/^FUNCTION (\w.*)$/);
          setState = false;
          func = tokens[1].trim();
          funcBody = '';
          return function () { };
        }
        else if (/^END/.test(l)) {
          var body = funcBody;
          var name = func;
          func = funcBody = '';
          if (setState) {
            setState = false;
            return function () {
               return function (ctx) { cur[name] = body.trim(); };
            }();
          }
          else {
            return function () {
              return function (ctx) { ctx[name] = new Function('ctx', body); };
            }();
          }
        }
        else if (/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)) {
          tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
          return function () {
            var __tokens = tokens;
            return function (ctx) { ctx[__tokens[1].trim()] = __tokens[2].trim(); };
          }();
        }
        else if (/^CREATE\s\s*(\w*) (.*)$/.test(l)) {
          tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
          if (tokens[1] == 'section') {
            return function () {
              var __tokens = tokens;
              return function (ctx) {
                ctx.sections.push(parse_properties(__tokens[2]));
                cur = ctx.sections[ctx.sections.length - 1];
              };
            }();
          }
          else if (tokens[1] == 'group') {
            return function () {
              var __tokens = tokens;
              return function (ctx) {
                ctx.groups.push(parse_properties(__tokens[2]));
                cur = ctx.groups[ctx.groups.length - 1];
              };
            }();
          }
          else if (tokens[1] == 'detail') {
            return function () {
              var __tokens = tokens;
              return function (ctx) {
                ctx.details.push(parse_properties(__tokens[2]));
                cur = ctx.details[ctx.details.length - 1];
              };
            }();
          }
        }
        else {
          throw new Error('report.loader : Unrecognized text after DEFINE');
        }
      }
      else {
        if (func) {
          funcBody += o;
          funcBody += '\n';
          return function () { };
        }
        throw new Error('report.loader : Unrecognized text');
      }
    }

    code.split('\n').forEach(function (l) { parseLine(l.trim(), l)(context); });

    return context;

  }

  function loadFromHTMLElement(element, ctx){

    var context = {
      sections : [],
      groups   : [],
      details  : [] 
    }

    core.elements('var', element)
        .map(function(v){
          var value = v.textContent;
          if(v.dataset.type == 'json') value = JSON.parse(value);
          if(v.dataset.type == 'int')  value = ~~value;
          context[v.dataset.name] = value; 
          return context[v.dataset.name];
        });

    core.elements('[data-section]', element)
        .map(function(s){ 
          var section = {
            type            : s.dataset.type,
            id              : s.id,
            template        : s.innerHTML,
            valueProviderfn : s.dataset.valueProviderfn
          };
          return context.sections.append(section);
        });

    core.elements('[data-group]', element)
        .map(function(g){ 
          var header = core.element('[data-header]', g);
          var footer = core.element('[data-footer]', g);
          var group = {
            key                   : g.dataset.key,
            id                    : g.id,
            header                : (header && header.innerHTML) || '',
            footer                : (footer && footer.innerHTML) || '',  
            headerValueProviderfn : g.dataset.headerValueProviderfn,
            footerValueProviderfn : g.dataset.footerValueProviderfn
          };
          return context.groups.append(group);
        });

    core.elements('[data-detail]', element)
        .map(function(d){ 
            var detail = {
              id              : d.id,
              template        : d.innerHTML,
              valueProviderfn : d.dataset.valueProviderfn
            };
            return context.details.append(detail);
        });

    return core.apply(context, ctx);

  }

  module.reports    = module.reports || {};
  module.reports.js = module.reports.js || {};
  module.reports.js.load = loadReport;

}(window[___ROOT_API_NAME]));