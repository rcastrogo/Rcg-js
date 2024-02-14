
(function(module){
  
  var core = module.core;
  var ui   = module.ui;

  function initSample(){

    var container;
    var txtSearch;

    function init(){
      txtSearch = core.$('txt-address');
      function log(){
        txtSearch.parentNode.appendChild(core.build('div', txtSearch.value));
      }
      txtSearch.addEventListener('keyup', ui.debounce(log, 350), false);
    }

    module.ajax.get('.//samples//debounce.html').then(function (txt) {
      container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      init();
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

