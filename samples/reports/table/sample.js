
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
      ajax.get('samples/reports/table/sample.rpt.txt')
          .then(function(txt) {
            var rpt = reports.load(txt);
            var engine = new reports.ReportEngine();
            // ===========================================================
            // Obtener los datos
            // ===========================================================
            ajax.get('samples/js/proveedores.json')
                .then(function(res){ 
                    var data = JSON.parse(res);
                    var html = engine.generateReport(rpt, data);
                    var div  = core.build('div', { innerHTML : html }, true)
                    reportContainer.appendChild(div);
                    //addEventListeners(div, {}, __rd.getContext());
                    if(rpt.onEndfn) rpt.onEndfn({ bs        : rpt.getContext().BS,
                                                  container : reportContainer,
                                                  core      : core });
                 });
          });    
    }

    ajax.get('samples/reports/table/sample.html').then(function (txt) {
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

  initSample();

}(window[___ROOT_API_NAME]));

