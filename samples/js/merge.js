
(function(module){
  
  var core      = module.core;
  var ui        = module.ui;
  var templates = module.templates;

  function initSample(){

    function toBold(a, b, c, d, e, f) {
      return '<b>{0}</b>'.format(a);
    }

    function toItalic(a, b, c, d, e, f) {
      return '<i>{0}</i> ({1}, {2}, {3}, {4}, {5})'.format(a, b, c, d, e, f);
    }

    function parseArray(arr, prop, separator) {
      return core.join(arr, prop, separator);
    }

    function init(data){

      var txtTemlate = core.$('txt-template');

      function merge(){
        var target = { 
          value : data[0], 
          fn    : { 
            toBold   : toBold, 
            toItalic : toItalic,
            parseArray : parseArray
          } 
        };
        core.$('merge-container')
            .innerHTML = templates.merge(txtTemlate.value, target);
      }

      module.pubsub.subscribe('template__merge__execute', merge);
      merge();
    }

    module.ajax.get('.//samples//merge.html').then(function (txt) {
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

