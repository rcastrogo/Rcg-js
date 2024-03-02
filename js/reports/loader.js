// =====================================================================================
// reports.loader
// =====================================================================================
(function (module) {

  function loadReport(code) {

      var context = {
          headers: [],
          groups: [],
          details: []
      };
      var current = [{ columns: [] }];
      var func = '';
      var params = '';
      var funcBody = '';

      function getValue(value) {
        if (value && value.trim().startsWith('@'))
          return context[value.trim().split('@')[1].trim()] || '';
        if (value)
          return value.trim();
        return '';
      }
      function parseProps(value) {
        // var __reg = /(id|colspan|rowspan|className|html|xbind|style|key|header|tag):('[^']*'|[^\s]*)/g;
        var regExp = /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
        var props = {};
        var match = regExp.exec(value);
        while (match != null) {
            var name = match[1].trim();
            var val  = getValue(match[2].trim().replace(/^'([^']*)'$/g, '$1'))
            props[name] = val;
            match = regExp.exec(value);
        }
        return props;
      }

      function parseCell(value) {
          return parseProps(value);
      }

      function parseRow(value) {
          var properties = parseProps(value);
          properties.columns = [];
          return properties;
      }

      function parseAttributes(data) {
        var attributes = [];
        Object.keys(data)
              .filter(function (key) { return key != 'columns' && key != 'html' && data.hasOwnProperty(key); })
              .forEach(function (key) {
                  var name = key == 'className' ? 'class' : key;
                  var val  = getValue(data[key]);
                  attributes.push('{0}="{1}"'.format(name, val));
              });
        return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
      }

      function createTable() {
          function fill(data, hide, header) {
              var sb = '';
              var cellTag = header ? 'th' : 'td';
              (data || []).forEach(function (row, i) {
                  var sb_row = '';
                  sb_row += '\n      <tr{0}>'.format(parseAttributes(row));
                  row.columns.forEach(function (col, i) {
                      sb_row += '\n        <{2}{0}>{1}</{2}>'.format(parseAttributes(col), getValue(col.html), cellTag);
                  });
                  sb_row += '\n      </tr>';
                  row.html = sb_row;
                  if (hide && hide.indexOf(i.toString()) > -1) return;
                  sb += sb_row;
              });
              return sb;
          }
          return (
            '<div table-container-locator>\n' +
            '  <table id="{3}" class= "w3-table-all" style="width:100%;">\n ' +
            '    <thead>' +
            '       {0}\n' +
            '    </thead>\n' +
            '    <tbody>' +
            '       {1}{2}\n' +
            '    </tbody>\n' +
            '  </table>\n' +
            '</div>'
          ).format(fill(context.headers, (context.hiddenHeaders || '').split(','), true), 
                   fill(context.details), 
                   fill(context.groups), 
                   context.tableId || '');
      }

      function parseLine(line) {
          
          var l = line.trim();

          if (!func && !l.trim()) return function () { };
          var __keys = /^(DEFINE|TEXT|#|ADD_COL|CREATE|FUNCTION|END|function|end)/;
          if (__keys.test(l)) {
              if (/^#/.test(l)) return function () { };
              else if (/^function/i.test(l)) {
                  var __tokens = l.match(/^(function)\s*([a-zA-Z0-9_\-]*)\s*\(([^\)]*?)\)/i);
                  func = __tokens[2].trim();
                  params = __tokens[3].trim() || 'ctx';
                  funcBody = '';
                  return function () { };
              }
              else if (/^END/i.test(l)) {
                  var body = funcBody;
                  var name = func;
                  func = funcBody = '';
                  return function () {
                      return params == '__text__' 
                             ? function (ctx) { ctx[name] = body; }
                             : function (ctx) { ctx[name] = new Function(params, body); };
                  }();
              }
              else if (/^ADD_COL /.test(l)) {
                  var __tokens = l.match(/ADD_COL (.*)$/);
                  return function () {
                      var tokens = __tokens;
                      return function (ctx) { current[current.length - 1].columns.push(parseCell(tokens[1])); };
                  }();
              }
              else if (/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)) {
                  var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
                  return function () {
                      var tokens = __tokens;
                      return function (ctx) { ctx[tokens[1].trim()] = tokens[2].trim(); };
                  }();
              }
              else if(/^TEXT/.test(l)){
                var __tokens = l.split(' ');
                  func = __tokens[1].trim();
                  params = '__text__';
                  funcBody = '';
                  return function () { };
              }
              else if (/^CREATE\s\s*(\w*)?(.*)$/.test(l)) {
                  var __tokens = l.match(/^CREATE\s\s*(\w*)?(.*)$/);
                  if (__tokens[1] == 'header') {
                      return function () {
                          var tokens = __tokens;
                          return function (ctx) { 
                            var header = parseRow(tokens[2]);
                            header['header-locator-' + ctx.headers.length] = '';
                            ctx.headers.push(header); 
                            current = ctx.headers; 
                          };
                      }();
                  }
                  else if (__tokens[1] == 'group') {
                      return function () {
                          var tokens = __tokens;
                          return function (ctx) { 
                            var group = parseRow(tokens[2]);
                            group['group-locator-' + ctx.groups.length] = '';
                            ctx.groups.push(group); 
                            current = ctx.groups; 
                          };
                      }();
                  }
                  else if (__tokens[1] == 'detail') {
                      return function () {
                          var tokens = __tokens;
                          return function (ctx) {
                            var detail = parseRow(tokens[2]);
                            detail['detail-locator'] = '';
                            ctx.details.push(detail); 
                            current = ctx.details; 
                          };
                      }();
                  }
                  else {
                      return function () {
                          var tokens = __tokens;
                          return function (ctx) { ctx[tokens[1]] = tokens[2]; };
                      }();
                  }
              }
              else {
                  throw new Error('Report.loader : Unrecognized text after DEFINE');
              }
          }
          else {
              if (func) {
                  funcBody += line;
                  funcBody += '\n';
                  return function () { };
              }
              throw new Error('Report.loader : Unrecognized text');
          }
      }

      code.split('\n').forEach(function (line) { parseLine(line)(context); });
      context.html = createTable();
      return context;
  }
  
  module.reports      = module.reports || {};
  module.reports.load = loadReport;

}(window[___ROOT_API_NAME]));