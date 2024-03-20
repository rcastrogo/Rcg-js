
(function page(module){

  var core      = module.core,
      pubsub    = module.pubsub,
      templates = module.templates,
      ui        = module.ui,
      modals    = ui.modals,
      config    = core.config('code-viewer');

  function initSample(){

    function init(container){

      function log(button, message){
        button.parentNode.appendChild(core.build('p', message));
      }

      function confirm(button){

        var message  = '¿Estás seguro de borrar los elementos seleccionados?';
        var title    = 'Eliminar elementos';
        var acceptfn = function(dlg) { log(button, 'Yes'); };
        var cancelfn = function(dlg) { log(button, 'No'); }
        var dlg = ui.modals.confirm(message, title, acceptfn, cancelfn, ['Yes', 'Noooooo'])
                           .configure(function(dlg){
                              log(button, 'confirm.configure');
                           })
                           .show();               
      }

      function showDialog(button, mouseEvent, arg, arg1){

        function cancel(dlg){
          log(button, 'closed');
        }

        function accept(){
          log(button, 'accept');
          dlg.close(true, true);
        }

        function createOrResolveContent(dlg){
          if(arg == 'string') return '<h2>Contenido</h2>';
          if(arg == 'element') return core.build('div', '<h3>DOMElement</h3>');
          if(arg == 'nodes') return [
            core.build('div', '<h3>Nodes</h3>', true),
            core.build('p', 
                       'A rectangular button with a gray hover effect. Default color is ' +
                       'light-gray in W3. CSS version 3.Default color is inherited ')
          ];
        }

        function configure(sender){
          dlg = sender
          dlg.btnAccept.disabled = false;
          dlg.btnAccept.onclick = accept;
          log(button, 'createDialog.configure');
        }

        var dlg = modals.createDialog(
                          'Datos del elemento', 
                          arg == 'id' ? { id : arg1 } 
                                      : createOrResolveContent, 
                          cancel, 
                          ['', 'Grabar y cerrar', 'Enviar'])
                        .configure(configure)
                        .show();
      }

      function showLayer(button, mouseEvent, arg){
        var layer = ui.dialogBuilder.showLayer(arg && arg == 'progress');
        setTimeout(function(){
          layer.close(true);                           
        }, 5000);   
      }    
      
      function changeFont(button, mouseEvent, arg){
        var target = core.element('.scv_Main', button.parentNode);
        var size = ~~target.style.fontSize.replace('px', ''); 
        if(arg == 'fixed'){
          if(target.style.maxHeight)
              target.style.maxHeight = '';
            else
              target.style.maxHeight = '500px';
        } else {
          target.style.fontSize = '{0}px'.format(size + (arg == 'up' ? 1 : -1 ));
          button.parentNode.style.height = 32 + core.element('.scv_TextContainer', target).scrollHeight + 'px';
          config.write('font-size', target.style.fontSize);
        }

      }    

      var messages = {
        error    : '<p class="w3-center">Se ha producido un error.</p>', 
        info     : '<p class="w3-center">Debe informar de esto y de lo otro...</p>',
        success  : '<p class="w3-center">Se ha eliminado el elemento.</p>',
        warning  : '<p class="w3-center">Se ha superado el límite admitido para el cliente.</p>'
      };

      ui.addEventListeners(container, {
        alert : function(button, mouseEvent, arg){
          ui.modals[arg](messages[arg], function(dlg){
            log(button, 'closed');
            /*return false*/
          })
          .configure(function(dlg){
            log(button, 'alert.configure');
            dlg.dialog.style.width = '350px';
            /*dlg.body.style.height = '250px';*/
          })
          .show();
        },
        confirm    : confirm,
        showDialog : showDialog,
        showLayer  : showLayer,
        changeFont : changeFont
      })
    }

    
    function loadCode(container){

      function create(id, code, title, className){
        var code_container = core.$(id);         
        var viewer  = ui.createTextViewer(code);
        var element = viewer.getControl();
        var main    = core.element('.scv_Main', element);
        main.classList.add('w3-code');          
        core.wrapp(main)
            .css('borderTop', 'solid 1px silver')
            .css('borderBottom', 'solid 1px silver')
            .css('borderRight', 'solid 1px silver')
            .css('fontSize', config.read('font-size', '13px'))
            .css('margin', '0', 'important');  
        core.element('.scv_TextContainer', element).classList.add(className); 
        code_container.appendChild(element); 
        code_container.style.height = 32 + core.element('.' + className, element).scrollHeight + 'px';

        ui.createCollapsibleBox(title, '', '-')
          .setContent(code_container)
          .appendTo(container)
          .control.classList.add('w3-margin');      
      }

      core.include('js/text-viewer.js', 'js-text-viewer', false)
          .then(function(){ 
            var code = page.toString();
            var html = document.documentElement.outerHTML;
            create('source-code-container', 
                   code, 
                   'Código JavaScript de la página', 
                   'jsHigh');
            create('html-code-container', 
                   html, 
                   'Código Html de la página', 
                   'htmlHigh');
          })
          .then(function(){
            core.include('js/w3codecolor.js')
                .then(function(){ setTimeout(w3CodeColor, 100); });          
          });
    }

    module.ajax.get('samples/dialogs.html').then(function (txt) {
      var container       = core.$('main-container'); 
      var sampleElement   = core.build('div', txt, false);
      container.innerHTML = '';
      container.appendChild(sampleElement);
      var sampleContainer = core.$('dialog-container', sampleElement);
      init(sampleContainer);
      loadCode(container);
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
