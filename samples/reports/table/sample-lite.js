
(function(module){
  
  var core    = module.core,
      ui      = module.ui,
      ajax    = module.ajax,
      reports = module.reports;

  function initSample(){

    var container;

    function init(){        
      var reportContainer = core.$('report-container');
      var engine   = new reports.ReportEngine();
      // =================================================================
      // Cargar el informe
      // =================================================================
      ajax.get('./samples/reports/table/sample-lite.rpt.txt')
          .then(function(txt) {
            var rpt = core.apply(reports.load(txt), context);
            // ===========================================================
            // Obtener los datos
            // ===========================================================
            ajax.get('./samples/js/proveedores.json')
                .then(function(res){ 
                    var data = JSON.parse(res);
                    var html = engine.generateReport(rpt, data);
                    var div  = core.build('div', { innerHTML : html }, true)
                    reportContainer.appendChild(div);
                    ui.addEventListeners(div, {}, rpt.getContext());
                    if(rpt.onEndfn) rpt.onEndfn({ bs        : rpt.getContext().BS,
                                                  container : reportContainer,
                                                  core      : core });
                 });
          });    
    }

    ajax.get('./samples/reports/table/sample-lite.html').then(function (txt) {
      container = core.$('main-container');
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));
      init();
    });

  }

  window.ff = function(id, a){
    return id;
  }

  window.fff = function(a, b, c, d, e){
    return '>>> ' + this.BS.data[b];
  }

  window.setTitle = function(a, b, c, d, e){
    return 'hola';
  }

  var context = {
    summary   : '{ }',
    orderBy   : '_descripcion,_nombre',
    iteratefn : function (item, i, arr, ctx){

    },
    onGroupFooter : function (sb, section, ctx){
      var utils = reports.js.ReportEngine.prototype;
      var data  = ctx.G1.all[section.current] || ctx.dataSet;
      var res   = utils.compute(data, { _id : 0, _nif : '' }); 
      var json  = JSON.stringify(res, null, 2);
      sb.append(
        '<tr><td colspan="5"><pre class="w3-container w3-black">{0}</pre></td></tr>'.format(json)
      );
    },
    onItemFooter : function (sb, section, ctx){
      sb.append('<tr><td colspan="5" style="height:2px;background-color:gray"></td></tr>');
    },
    onRowfn : function (ctx) {

    },
    onRowEndfn : function (ctx) {

    },
    onEndfn : function (ctx){
      var core  = ctx.core;
      var utils = rcg.reports.js.ReportEngine.prototype;
      var sum   = utils.compute(ctx.bs.dataSet, '_id');

      var res   = utils.compute(ctx.bs.dataSet, { _id : 0, _nif : '' });

      var result = {};
      utils.toGroupWrapper(ctx.bs.dataSet, result)
                          ('_descripcion', '_id,_nif', 'descripcion')
                          ('_id', '_id', 'identificador')
                          ('_nif', '_id', 'nif');
      console.log(sum);
      console.log(res);
      console.log(result);

      ctx.container.appendChild(
        core.build('pre', { className   : 'w3-container w3-black',
                            textContent : JSON.stringify(res, null, 2) })
      );
    },
    onStartfn : function (ctx){

      ctx.fn = {
        sayHello: function (a, b, c, d) {
          console.log(a,b,c,d);
          alert('Hola');
        },
        headerG1 : function(key, b){
          return '<tr class="w3-teal"><td colspan="5">{0}</td></tr>'.format(key);
        },
        fixDate : function(value, b){
          return value.fixDate();
        },
        fixDate2 : function(scope, sender, value, a, b, c){
          return '- ' + value.fixDate();
        }
      }

      this.getContext = function () {
        return { BS : ctx };
      }

    }
  };


  initSample();

}(window[___ROOT_API_NAME]));

