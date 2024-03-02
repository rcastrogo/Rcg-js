
(function(module){
  
  var core      = module.core,
      ui        = module.ui,
      pubsub    = module.pubsub,
      templates = module.templates;


  var MESSAGE_LOG = 'msg//sample//editable-grid//log';

  function initSample(){

    var container, table, grid;
    var data = [ 
      { id: 1, descripcion: 'Descripción 1' },
      { id: 2, descripcion: 'Descripción 2' },
      { id: 3, descripcion: 'Descripción 3' }
    ];

    function init(){

      container = core.$('editable-grid-container');
      table     = core.element('table', container);
      
      ui.addEventListeners(
        templates.fillTemplate(container, data, true), 
        {
          writeLog: function (e, value, mode) {
            if (mode && mode == 'append') return e.innerHTML += value + '<br/>';
            e.innerHTML = value;
          },
          doSave: function () {
            var d = container.querySelectorAll('td div[data-index]')
                             .toArray()
                             .map(function (c) { return c.textContent; })
                             .split(2)
                             .map(function (cells, i) {
                                 return { 
                                   source      : data[i],
                                   edit        : { 
                                     id          : cells[0],
                                     descripcion : cells[1] 
                                   } 
                                 };
                             });
            pubsub.publish(MESSAGE_LOG, JSON.stringify(d, null, 2));
          }
        }, 
        {
          MESSAGE : { 
            MESSAGE_LOG : MESSAGE_LOG 
          }
        }
      );

      grid = new ui.EditableGrid(
        table, 
        // ===============================================================================
        // onfocus
        // ===============================================================================
        function (sender, event) {
          event.target.style.outline = '1px solid gray';
          var message = 'onfocus -> [{target.dataset.index}, {td.cellIndex}] id: {tr.id}';
          pubsub.publish(MESSAGE_LOG, message.format(event));
        },
        // ===============================================================================
        // onchange
        // ===============================================================================
        function (sender, event) {
            var message = 'onChange -> [{target.dataset.index}, {td.cellIndex}] ' +
                          'id: {tr.id} [ {previous} -> {current}]';
            pubsub.publish(MESSAGE_LOG, message.format(event));
        }
      );

      // =================================================================================
      // CollapsibleBox
      // =================================================================================
      var collapsibleBox = ui.createCollapsibleBox('Mensajes')
                             .appendTo(container)
                             .setContent(container.querySelector('[log]'));
      collapsibleBox.onexpand.add(function (eventName, sender) {
        console.log(eventName, sender);
      });

      collapsibleBox.getControl().classList.add('w3-margin-top');
      setTimeout(function () { return collapsibleBox.expand(); }, 5000);

    }

    module.ajax.get('samples/editable-grid.html').then(function (txt) {
      container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      module.core.include('js/editable-grid.js').then(init);
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

