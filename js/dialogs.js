
// ==============================================================================================================
// ui.showContextMenu
// ==============================================================================================================
(function(module){

  var core = module.core;

  var menu = core.build('div', '<div id="context-menu-container" class="w3-dropdown-content w3-bar-block w3-card-4 w3-animate-opacity"></div>', true);
  var menuItem  = core.build('div', '<a href="#" class="w3-bar-item w3-button"></a>', true);
  var sepatator = core.build('div', '<div style="background-color:silver; height:1px"></div>', true);

  function closeMenu(){
    menu.classList.remove('w3-show');
    document.body.removeEventListener('mouseup', closeMenu);
  }

  function setMenuPosition(position) {
    var menuWidth    = menu.offsetWidth + 4;
    var menuHeight   = menu.offsetHeight + 4;
    var windowWidth  = window.innerWidth;
    var windowHeight = window.innerHeight;

    if (windowWidth - position.x < menuWidth)
      menu.style.left = (windowWidth - menuWidth - (windowWidth - position.x)) + "px";
    else
      menu.style.left = position.x + "px";

    if (windowHeight - position.y < menuHeight)
      menu.style.top = (windowHeight - menuHeight - (windowHeight - position.y)) + "px";
    else
      menu.style.top = position.y + "px";
  }

  module.ui.showContextMenu = function(pos, items){ 
    // ===================================================================
    // Inicializar el menú y su comportamiento
    // ===================================================================
    if(menu.parentNode != document.body) document.body.appendChild(menu);
    setTimeout(function(){ 
      document.body.addEventListener('mouseup', closeMenu); 
    }, 50);
    // ===================================================================
    // Añadir elementos del menú
    // ===================================================================
    menu.innerHTML = '';
    items.map(function(item){
      if(item.text == '-') return menu.appendChild(sepatator.cloneNode(true));
      var tempMenu = menuItem.cloneNode(true);
      tempMenu.innerHTML = item.text;
      tempMenu.onclick = item.onclick || function(){};
      menu.appendChild(tempMenu);
    });
    // ===================================================================
    // Mostrar y posicionar el menú
    // ===================================================================
    if(!menu.classList.contains('w3-show')) menu.classList.add('w3-show');
    setMenuPosition(pos);
  };

}(window[___ROOT_API_NAME]));

// ==============================================================================================================
// ui.dialogBuilder
// ==============================================================================================================
(function (module) {

  var core     = module.core,
      ui       = module.ui,
      events   = module.events;

  var styles = 'data:text/css;base64,ICAgIC5kaWFsb2ctd3JhcHBlciB7CiAgICAgICAgcG9zaXRpb246IGFic29sdXRlOwogICAgICAgI' + 
               'Gluc2V0OiAwOwogICAgICAgIGRpc3BsYXk6bm9uZTsKICAgIH0KICAgIC5kaWFsb2ctaGVhZGVyIHsKICAgICAgICBtaW4taGV' + 
               'pZ2h0OiAzM3B4OwogICAgfQoKICAgIC5kaWFsb2ctdGl0bGUgewogICAgICAgIGJhY2tncm91bmQtY29sb3I6IGdyYXk7CiAgI' + 
               'CAgICAgY29sb3I6IHdoaXRlOwogICAgICAgIHBhZGRpbmc6IDJweCA0cHg7CiAgICAgICAgbWFyZ2luOjA7CiAgICAgICAgdGV' + 
               '4dC1hbGlnbjpjZW50ZXIKICAgIH0KICAgIC5kaWFsb2ctYm9keXsKICAgICAgICBwYWRkaW5nOiA4cHg7CiAgICAgICAgYm9yZ' + 
               'GVyLXRvcDogc29saWQgMXB4IGJsYWNrOwogICAgfQogICAgLmRpYWxvZy1jbG9zZSB7CiAgICAgICAgZmxvYXQ6IHJpZ2h0Owo' + 
               'gICAgICAgIG1hcmdpbjogMnB4OwogICAgfQogICAgLmRpYWxvZy1sYXllciB7CiAgICAgICAgcG9zaXRpb246IGZpeGVkOwogI' + 
               'CAgICAgIGluc2V0OiAwOwogICAgICAgIGJhY2tncm91bmQtY29sb3I6IGJsYWNrOwogICAgICAgIG9wYWNpdHk6IC44OwogICA' + 
               'gICAgIGJhY2tncm91bmQ6IGJsYWNrIG5vLXJlcGVhdCBjZW50ZXIgY2VudGVyOwogICAgICAgIGJhY2tncm91bmQtc2l6ZTogM' + 
               'TIlOyAKICAgIH0KICAgIC5kaWFsb2cgewogICAgICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlOwogICAgICAgIHBvc2l0aW9' + 
               'uOiByZWxhdGl2ZTsKICAgICAgICB3aWR0aDogNTAlOwogICAgICAgIG1hcmdpbjogMCBhdXRvOwogICAgICAgIHRvcDogMTAlO' + 
               'wogICAgfQogICAgLmRpYWxvZy1mb290ZXIgewogICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgICAgICBib3JkZXItdG9' + 
               'wOiBzb2xpZCAxcHggc2lsdmVyOwogICAgICAgIG1hcmdpbjogMDsKICAgICAgICBwYWRkaW5nOiA4cHggMCAwIDA7CiAgICB9' +
               'LmRpYWxvZy1mb290ZXIgYnV0dG9ueyBtYXJnaW4tcmlnaHQ6NnB4OyB9Ci5kaWFsb2ctZm9vdGVyIGJ1dHRvbjpsYXN0LWNoaW' +
               'xkIHsgbWFyZ2luLXJpZ2h0OiAwOyB9';

  function loadStyles(){
    var pending = core.$('link')
                      .where({ id : 'css-dialog'})
                      .length == 0;
    if(pending){
      core.element("head")
          .appendChild(
            core.build('link', { rel  : 'stylesheet', 
                                 id   : 'css-dialog', 
                                 href : styles } )
          ); 
    }
  }


  var TEMPLATE = '<div class="dialog-wrapper">' + 
                 '  <div class="dialog-layer" style="z-index:10001"></div>' +
                 '  <div class="dialog" style="z-index:10002">' +
                 '    <div class="dialog-header">' +
                 '      <button type="button" class="dialog-close">&times;</button>' +
                 '      <h4 class="dialog-title">{title}</h4>' +
                 '    </div>' +
                 '    <div class="dialog-body">{body}</div>' +
                 '  </div>' +
                 '</div>';
  ui.dialogBuilder = {
      stack : [],
      build : function (o) {
        var that = this;
        var options = {};
        if(core.isFunction(o)){
          options.oncreated = o;
          options.title = '';
          options.body  = '';
        } else {
          options = { 
            title     : o && o.title || '', 
            body      : o && o.body  || '',
            oncreated : o && o.oncreated
          };
        }
        var element = core.build('div', TEMPLATE.format(options), true);
        document.body.appendChild(element);
        var target = { 
          element  : element,
          dialog   : element.querySelector('.dialog'),
          header   : element.querySelector('.dialog-header'),
          body     : element.querySelector('.dialog-body'),
          title    : element.querySelector('.dialog-title'),
          layer    : element.querySelector('.dialog-layer'),
          btnClose : element.querySelector('.dialog-close'),
          show     : function() {
            loadStyles();
            var previous = that.stack.lastItem();
            if(previous == target) return this;
            if(previous) {
              previous.layer.style.opacity = '0';
            }
            this.element.style.display = 'block'; 
            return that.stack.add(this);
          },
          close    : function(remove, cancelEvent) {
            // ===========================================================
            // Posibilitar la no invocación de la notificación de cerrado
            // ===========================================================
            if(cancelEvent !== true){
              var eventArgs = { result : true };
              this.onclose.dispatch(eventArgs);
              if(eventArgs.result === false) return this;
            }
            // ===========================================================
            // Cerrar
            // ===========================================================
            this.element.style.display = 'none'; 
            ui.dialogBuilder.stack.pop();
            var previous = that.stack.lastItem();
            if(previous) {
              previous.layer.style.opacity = '';
            }
            if(remove === true) this.element.remove();            
            return this; 
          },
          sendToBack  : function(){
            this.dialog.style.zIndex = ~~his.layer.style.zIndex - 2; 
            return this; 
          },
          sendToFront : function(){ 
             this.dialog.style.zIndex = ~~his.layer.style.zIndex + 1; 
            return this; 
          },
          find       : function(selector) {return core.$(selector, element); },
          configure  : function(fn){ fn(this); return this; }
        };
        target.onclose = new events.Event(target);
        target.btnClose.onclick = function(){ target.close(true); };
        if(options.oncreated) options.oncreated(target);
        return target;
      },
      showLayer : function(showProgress){
        function oncreated(dlg) { 
          dlg.dialog.remove();
          if(showProgress){
            dlg.layer.style.backgroundImage = 'url(https://i.stack.imgur.com/hzk6C.gif)';
          }
        }
        return this.build({ oncreated : oncreated }).show();
      },
      closeAll : function(){
        ui.dialogBuilder.stack.map(function(item){ 
          item.element.remove();
        });
        ui.dialogBuilder.stack = [];
      },
      SHOW_PROGRESS_BAR : true,
      CLOSE             : true
  };

}(window[___ROOT_API_NAME]));

// ==============================================================================================================
// ui.modals
// ==============================================================================================================
(function (module) {

  var core   = module.core,
      ui     = module.ui,
      modals = ui.modals = {};

  modals.confirm = function(message, title, onagree, onreject, buttons){
    var TEMPLATE = '<div body-content><p>{0}</p></div>' +
                   '<p class="dialog-footer">' +
                   '   <button btn-accept class="w3-button w3-teal" type="button">Aceptar</button>' +
                   '   <button btn-cancel class="w3-button w3-teal" type="button">Cancelar</button>' +
                   '</p>';
    var oncloseEventId;
    return ui.dialogBuilder.build(function(dlg){     
      dlg.btnClose.style.visibility = 'hidden';
      dlg.title.classList.add('w3-teal');
      dlg.title.textContent = title || '';
      dlg.body.innerHTML = TEMPLATE.format(message);
      var targets = dlg.find('.dialog-footer button');
      if(buttons && buttons[0]) targets[0].innerHTML =  buttons[0];
      if(buttons && buttons[1]) targets[1].innerHTML =  buttons[1];
      targets[0].onclick = function(){
        dlg.dialogResult = true;
        var result = undefined;
        if(onagree) result = onagree(dlg);
        if(result !== false){
          dlg.onclose.remove(oncloseEventId);
          dlg.close(true, true); 
        }
      };
      targets[1].onclick = function(){ 
        dlg.dialogResult = false;
        dlg.close(true); 
      };
      oncloseEventId = dlg.onclose.add(function(sender, args){ 
        if(onreject) args.result = onreject(dlg); 
      });
    });
  }

  modals.alert = function(message, title, onclose, headerClass){
    var TEMPLATE = '<div body-content><p>{0}</p></div>' +
                   '<p class="dialog-footer">' +
                   '   <button btn-accept class="w3-button w3-teal" type="button">Aceptar</button>' +
                   '</p>';
    return ui.dialogBuilder.build(function(dlg){     
      dlg.btnClose.style.visibility = 'hidden';
      if(title){
        dlg.title.classList.add(headerClass || 'w3-teal');
        dlg.title.textContent = title;
      } else {
        dlg.header.style.display = 'none'
      }
      dlg.body.innerHTML = TEMPLATE.format(message);
      dlg.find('[btn-accept]')[0].onclick = function(){ dlg.close(true); };
      dlg.onclose.add(function(sender, args){
        if(onclose) args.result = onclose(sender);
      });
      dlg.footer      = dlg.body.querySelector('.dialog-footer');
      dlg.bodyContent = core.element('[body-content]', dlg.body);
    });
  }
  
  var resolved = {};

  modals.createDialog = function(title, content, onclose, buttons){
    var dlg = modals.alert('', title || '', onclose);
    dlg.btnClose.style.visibility = 'visible';
    if(core.isFunction(content)) content = content();
    if(content && content.id){
      var element = resolved[content.id] || core.element(content.id);
      if(element){
        if(!resolved[content.id]) resolved[content.id] = element;
        dlg.bodyContent.innerHTML = '';
        dlg.bodyContent.appendChild(element);
      }
    }
    else if(core.isString(content)){
      dlg.bodyContent.innerHTML = content;
    }
    else if(content && content.tagName){
      dlg.bodyContent.innerHTML = '';
      dlg.bodyContent.appendChild(content);
    }
    else if(content && core.isArray(content)){
      dlg.bodyContent.innerHTML = '';
      content.forEach(function(node){ dlg.bodyContent.appendChild(node); });
    }
    var targets = dlg.find('.dialog-footer button');      
    if(buttons && buttons.length){
      dlg.btnAccept          = targets[0];
      dlg.btnAccept.onclick  = function(){};
      dlg.btnAccept.disabled = true;
      var btn    = buttons.shift(1);
      var target = targets.shift(1);
      while(btn != undefined){
        if(target && btn)
          target.innerHTML = btn;
        else if(btn != '')
          dlg.footer
             .appendChild(
               core.build(
                 'div', 
                 '<button btn-{0|toUpperCase|replaceAll, ,-} class="w3-button w3-teal" type="button">{0}</button>'.format(btn),
                 true
               )
             );
        btn    = buttons.shift(1);
        target = targets.shift(1);
      }
    }
    return dlg;
  }

  modals.info    = function(message, onclose){ return modals.alert(message, 'Información', onclose, 'w3-blue'); };
  modals.success = function(message, onclose){ return modals.alert(message, 'Mesaje', onclose, 'w3-green'); };
  modals.warning = function(message, onclose){ return modals.alert(message, 'Aviso', onclose, 'w3-yellow'); }
  modals.error   = function(message, onclose){ return modals.alert(message, 'Error', onclose, 'w3-red'); };

  core.ready(function(){
    console.log('ui.modals.configure');
  });

}(window[___ROOT_API_NAME]));
