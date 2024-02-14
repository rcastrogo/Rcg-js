﻿/// <reference path="../../js/rcg-js.js" />

(function(module){
  
  var core = module.core;
  var ui   = module.ui;
  var templates = module.templates;

  function initSample(){

    function init(data){
      var template = core.element('.js-item-template');
      var html     = templates.executeTemplate(template, data);
      core.$('list-container')
          .appendChild(
            core.build('div', html)
          );
    }

    module.ajax.get('.//samples//execute-template.html').then(function (txt) {
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

