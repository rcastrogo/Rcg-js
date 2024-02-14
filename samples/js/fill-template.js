
(function(module){
  
  var core      = module.core;
  var ui        = module.ui;
  var templates = module.templates;

  function initSample(){

    function init(data){
      var list_template = core.element('list-container');
      var item_template = core.element('item-container');
      templates.fillTemplate(list_template, data, true);
      templates.fillTemplate(item_template, data[0], true); 
    }

    module.ajax.get('.//samples//fill-template.html').then(function (txt) {
      var container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      module.ajax.get('.//samples//js//template-data.json').then(function (response) {
        init(JSON.parse(response));
      })     
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

