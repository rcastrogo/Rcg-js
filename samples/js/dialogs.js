
(function(module){

  var core      = module.core,
      pubsub    = module.pubsub,
      templates = module.templates,
      ui        = module.ui,
      modals    = ui.modals;

  function initSample(){

    function init(container){

      //  var message = '¿Estás seguro de borrar los elementos seleccionados?';
      //  var title   = 'Eliminar direcciones';
      //  ui.modals.confirm(message, title, 
      //                    function(dlg) {
      //                      callback('ok');
      //                      //return false;
      //                    }, 
      //                    function(dlg){
      //                      callback();
      //                      //return false;
      //                    });
               
      //});

      //lv.events.onEdit.add(function(sender, eventArgs){
      //  var dlg,
      //      target   = eventArgs.target,
      //      callback = eventArgs.result;

      //  function cancel(dlg){
      //    callback(target.item);
      //    //return false;
      //  }

      //  function accept(){
      //    target.item.address.summary += ' !'; 
      //    callback(target.item);
      //    dlg.close(true, true);
      //  }

      //  function createContent(dlg){
      //    return 'Elemento';
      //  }

      //  function init(sender){
      //    dlg = sender
      //    dlg.btnAccept.disabled = false;
      //    dlg.btnAccept.onclick = accept;
      //  }

      //  modals.createDialog('Datos de la dirección', createContent, cancel)
      //        .init(init)
      //        .show();
      //});


      //      var layer = ui.dialogBuilder.showLayer(true);
      //      setTimeout(function(){
      //        layer.close(true);                           
      //      }, 10000);                                

      var messages = {
        error    : '<p class="w3-center">Se ha producido un error.</p>', 
        info     : '<p class="w3-center">Debe informar de esto y de lo otro...</p>',
        success  : '<p class="w3-center">Se ha eliminado el elemento.</p>',
        warning  : '<p class="w3-center">Se ha superado el límite admitido para el cliente.</p>'
      };
      ui.addEventListeners(container, {
        alert : function(button, mouseEvent, arg){
          ui.modals[arg](messages[arg], function(dlg){
            //return false
          });
        }
      })
    }

    module.ajax.get('samples/dialogs.html').then(function (txt) {
      var container       = core.$('main-container'); 
      var sampleElement   = core.build('div', txt, false);
      container.innerHTML = '';
      container.appendChild(sampleElement);
      var sampleContainer = core.$('dialog-container', sampleElement);
      init(sampleContainer);          
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
