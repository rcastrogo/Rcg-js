
(function(module){
  
  var core      = module.core;
  var ajax      = module.ajax;
  var ui        = module.ui;

  function test(){
    var form = core.element('form');
    var data = ajax.formToJSON(form);
    console.log(data);

    var query = ajax.formToQuery(form)
    console.log(query);
  }

  function initSample(){

    function initTextBoxes(){
      ui.attachCalendar('.js-date-control');     
    }

    function init(){
      core.element('btnSend').onclick = test;

      var data;
      ajax.get('samples/js/proveedores.json')
          .then(function(res){
            
            data = JSON.parse(res);

            ui.createList()
              .load(data, '<li id="list-item-{_id}" tabIndex="0">{_descripcion} <span>{_nombre}</span></li>')
              .appendTo(core.element('list-container'))
              .addEventListener('selectedChanged', function(sender, eventArg){ 
                console.log(eventArg.item.id); 
              });

              var autoComplete1 = ui.attachAutocomplete(core.element('txt-autocomplete'), 'samples/js/proveedores.json')
                                    .setTextProvider(function(item){ return item._nombre; })
                                    .addEventListener('select', function(sender, value){
                                      console.log(sender, value);
                                    });

              var autoComplete2 = ui.attachAutocomplete(core.element('txt-autocomplete2'))
                                    .setDataSource(data)
                                    .setTextProvider(function(item){ return item._nombre; })
                                    .setFilter(function(item, value){ 
                                      return item._nombre.indexOf(value) > -1; 
                                    })
                                    .addEventListener('select', function(sender, value){
                                      console.log(sender, value);
                                    });
              var autoComplete3 = ui.attachAutocomplete(core.element('txt-autocomplete3'))
                                    .setDataSource(function(value, fn){
                                       ajax.get('samples/js/template-data.json?q={0}'.format(value))
                                           .then(function(res){
                                              fn(JSON.parse(res));
                                           });
                                    })
                                    .setTextProvider(function(item){ 
                                      return item.email; 
                                    })
                                    .addEventListener('select', function(sender, value){
                                      console.log(sender, value);
                                    });

              var combo1 = ui.attachComboBox(core.element('cmb-proveedores'))
                             .addEventListener('select', function(sender, value){
                                console.log(sender, value);
                             })
                             .setResolver({ 
                                 text : '_nombre',
                                 id   : '_id'
                             })
                             .setDataSource(data);
              var combo2 = ui.attachComboBox(core.element('cmb-nombres'))
                             .addEventListener('select', function(sender, value){
                                console.log(value, sender.getSelectedIndex());
                             })
                             .setDataSource(
                               data.map(function(p){ return p._nombre; })
                             );

          });
      
      core.include('js/calendar.js', 'calendar')
          .then(initTextBoxes); 
    }

    module.ajax.get('samples/controls.html').then(function (txt) {
      var container = core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));
      core.include('js/list.js', 'js-list', false)
          .then(init);
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

