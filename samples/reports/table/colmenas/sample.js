
(function(module){
  
  var core    = module.core,
      ui      = module.ui,
      ajax    = module.ajax,
      reports = module.reports,
      utils   = reports.js.ReportEngine.prototype;

  var mainContainer,
      reportContainer,
      engine   = new reports.ReportEngine();

  var data = [];

  // ==============================================================================
  // Funciones del informe
  // ==============================================================================
  var context = {

    orderBy   : 'municipio',
    iteratefn : function (item, i, arr, ctx){
      item.valor = ~~item.valor;
      item.__groupId = '{0}-{1}'.format(item.municipio, item.indicador);
    },
    onGroupFooter : function (sb, section, ctx){
      var group = ctx[section.name];
      group = (group && group.data) || ctx.G0; 
      sb.append(
        '<tr><td colspan="4">El valor total es {valor}, el máximo {_max_.valor} y el mínimo {_min_.valor}</td></tr>'.format(group)
      );    
    },
    onItemFooter : function (sb, section, ctx){
      //sb.append('<tr><td colspan="5" style="height:2px;background-color:gray"></td></tr>');
    },
    onRowfn : function (ctx) {

    },
    onRowEndfn : function (ctx) {
    },
    onEndfn : function (ctx){
      //var core  = ctx.core;
      //var utils = rcg.reports.js.ReportEngine.prototype;
      //var sum   = utils.compute(ctx.bs.dataSet, '_id');

      //var res   = utils.compute(ctx.bs.dataSet, { _id : 0, _nif : '' });

      //var result = {};
      //utils.toGroupWrapper(ctx.bs.dataSet, result)
      //                    ('_descripcion', '_id,_nif', 'descripcion')
      //                    ('_id', '_id', 'identificador')
      //                    ('_nif', '_id', 'nif');
      //console.log(sum);
      //console.log(res);
      //console.log(result);

      //ctx.container.appendChild(
      //  core.build('pre', { className   : 'w3-container w3-black',
      //                      textContent : JSON.stringify(res, null, 2) })
      //);

      var rows = core.$('tr.resume', reportContainer)
                     .reduce(function(a, row){
                          a.push({ count  : ~~row.cells[1].textContent,
                                   cells  : core.toArray(row.cells)
                                                .map( function(c){ return c;})
                                 });
                          return a;
                      }, []);
      rows.forEach( function(d){
        d.cells.forEach(function(c, i){
          var porcentaje = Math.random();
          var height     = porcentaje * 50;                          
          c.appendChild(
            core.build(
              'div', { className : 'bar',
                       style     : { height    : '{0}px'.format(height),
                                     margin    : '0 10%',
                                     marginTop : '{0}px'.format(50 - height) }}
            )
          );
          c.appendChild(
            core.build('span', { innerHTML : (porcentaje < 1) ? (porcentaje * 100).toFixed(1) + '%'
                                                              : '100%',
                                 style     : { fontWeight : 'normal',
                                               fontSize   : '8px' }}
            )
          );
          c.appendChild(core.build('br'));
          c.appendChild(document.createTextNode((porcentaje * 100).toFixed(1)));  
        });                     
      });
    },
    onStartfn : function (ctx){

      ctx.fn = {
        headerG1 : function(key, b){
          var label = data.municipios[key];
          return '<tr class="w3-white"><td colspan="4"><b>Municipio: </b>{0}</td></tr>'.format(label);
          //return { attributes: '', text : '<td>Hola</td>' };
        },
        headerG2 : function(key, b){
          var label = data.indicadores[key];
          return '<tr class="w3-white"><td colspan="4"><b>Indicador: </b>{0}</td></tr>'.format(label);
        }
      }

      this.getContext = function () {
        return { BS : ctx };
      }

      // ---------------------------------------------------------
	    // Totales
	    // ---------------------------------------------------------
	    ctx.__computed       = {};
	    ctx.__computed.total = utils.compute(ctx.dataSet, 'valor');
      utils.group(ctx.dataSet, ctx.__computed)		
								 ('__groupId', 'valor')  // municipio + indicador
								 ('indicador', 'valor')  // indicador
								 ('municipio', 'valor'); // municipio
      console.log(ctx.__computed);
    }
  };

  // ==============================================================================
  // Inciacilización
  // ==============================================================================
  (function initSample(){

    // ============================================================================
    // Transformar los datos
    // ============================================================================
    function transform(data){

      function createDictionary(target){
        return target.codes.reduce( function(d, c, i){
                 d[c] = target.labels[i];
                 return d;
               }, {});
      }

      var indicadores = createDictionary(data.categories[0]);
      var municipios  = createDictionary(data.categories[1]);
      var tipos       = createDictionary(data.categories[2]);
      var rows        = data.data.map(function(d){
                          return { 
                            indicador : d.dimCodes[0], 
                            municipio : d.dimCodes[1], 
                            tipo      : d.dimCodes[2], 
                            valor     : d.Valor};
                          }
                        );
      return { indicadores : indicadores, municipios : municipios, tipos : tipos, rows : rows };
    }

    // ============================================================================
    // Obtener los datos
    // ============================================================================
    function loadData(){
      ajax.get('samples/js/datos-colmenas-canarias.json')
          .then(function(res){ 
              data = JSON.parse(res);
              data = transform(data);
              loadReport();
          });
    }

    // ============================================================================
    // Cargar el informe
    // ============================================================================
    function loadReport(){        
      reportContainer.innerHTML = '';
      ajax.get('samples/reports/table/colmenas/sample.rpt.txt')
          .then(function(txt) {
            var rpt  = core.apply(reports.load(txt), context);           
            var html = engine.generateReport(rpt, data.rows);
            var div  = core.build('div', { innerHTML : html }, true)            
            reportContainer.appendChild(div);
            if(rpt.onEndfn) rpt.onEndfn({ bs        : rpt.getContext().BS,
                                          container : reportContainer,
                                          core      : core });
          });    
    }

    function make(){
      var container = core.$('info-container');
      var targets = core.elements('div.w3-code')
                        .map(function(div) {
                          var p = div.previousElementSibling;
                          p.parentNode.removeChild(p);
                          return { 
                            div : div, 
                            p   : p,
                            box : ui.createCollapsibleBox(p.textContent, '', '-')
                          };
                        }); 
      targets.forEach(function(t){
        container.appendChild(core.build('p'));
        t.box.appendTo(container)
             .setContent(t.div);
      });

      core.elements('div.w3-code code')
          .map(function(c){
            var lines = c.textContent.split('\n');
            var tabs = 0;
            var i = -1;
            while(true){
              i++;
              if(i > lines.length -1) break;
              var line = lines[i].trim();
              if(line.length){
                tabs = lines[i].match(/^(\s*)/)[0].length;
                if(tabs && tabs > 0) break;
              }
            }
            var replaceReg = new RegExp('^(\\s{{0}})'.format(tabs), 'g');
            lines = lines.map(l => l.replace(replaceReg, ''));
            c.textContent = lines.join('\n');
          });


      core.include('js/w3codecolor.js')
          .then(function(){ setTimeout(w3CodeColor, 300); });
    }

    ajax.get('samples/reports/table/colmenas/sample.html').then(function (txt) {
      mainContainer = core.$('main-container');
      mainContainer.innerHTML = '';
      mainContainer.appendChild(core.build('div', txt, false));
      reportContainer = core.$('report-container');
      ui.addEventListeners(
        mainContainer, 
        {
          loadReport : loadReport
        });
      openTab(core.element('.btn-report'), 'report-tab');
      loadData();
      make();
    });

  })();

}(window[___ROOT_API_NAME]));

function openTab(evt, tabName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("tab");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-red", ""); 
  }
  document.getElementById(tabName).style.display = "block";
  evt.className += " w3-red";
}