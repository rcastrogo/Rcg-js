
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
      ajax.get('samples/reports/txt/sample.rpt.txt')
          .then(function(txt) {
            var rpt = reports.load(txt);
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

    ajax.get('samples/reports/txt/sample.html').then(function (txt) {
      container = core.$('main-container');
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));
      init();
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

