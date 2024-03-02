
(function(module){
  
  var core    = module.core,
      ui      = module.ui,
      ajax    = module.ajax,
      reports = module.reports.js;

  function initSample(){

    var container;

    function init(){        
      var reportContainer = core.$('report-container');
      var engine   = new reports.ReportEngine();
      var mediator = engine.createMediator();
      // =================================================================
      // Cargar el informe
      // =================================================================
      ajax.get('samples/reports/html/sample.rpt.html')
          .then(function(html) {
            var div = core.build('div', html);
            var ctx = createReportContext();
            var rpt = reports.load(div, ctx);
            rpt = core.apply(rpt, createReportContext());
            // ===========================================================
            // Obtener los datos
            // ===========================================================
            ajax.get('samples/js/proveedores.json')
                .then(function(res){ 
                    var data = JSON.parse(res);
                    var html = engine.generateReport(
                                        rpt, 
                                        data, 
                                        mediator.clear()
                                      );
                    reportContainer.innerHTML = html;
                    //addEventListeners(target, {}, __rd.getContext());
                 });
          });    
    }

    ajax.get('samples/reports/html/sample.html').then(function (txt) {
      container = core.$('main-container');
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));
      init();
    });

  }

  function createReportContext(){
      return {
        onInitSummaryObject : function (summary) { return summary; },
        iteratefn: function (ctx) { },
        onStartfn: function (ctx) {

          ctx.fn = {
            fixDate3: function (value, b) {
              return '3333-------66666';
            },
            sayHello: function (a, b, c) {
              alert(__a());
            },
            getReportDate: function () {
              return new Date().toDateString();
            },
            d3_provider_fn: function () {
              return (ctx.isLastRowInGroup) ? '' : '<div style="width:98%; margin:1px; background-color:silver; height:2px;"></div>';
            },
            header_provider_fn: function (g) { 
              return '<h2 class="w3-teal">' + (g.current || 'Sin comunidad') + '</h2>'; 
            },
            footer_provider_fn: function (g) {
              return '<h4>pie del grupo</h4>';
            }
          };

          this.getContext = function () {
            return { BS: ctx };
          }

        },
        onRowfn: function (ctx) { },
        onGroupChangefn: function (ctx) {  }
      }
  }

  initSample();

}(window[___ROOT_API_NAME]));

