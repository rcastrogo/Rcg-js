
(function(module){
  
  var core      = module.core;
  var ui        = module.ui;
  var pubsub    = module.pubsub;

  var MESSAGE = { 
    ON_CHANGE_MUNICIPIO  : 'ON_CHANGE_MUNICIPIO',
    ON_LOG_MESSAGE       : 'ON_LOG_MESSAGE',
    MSG_INPUT_CHANGE_01  : 'MSG_INPUT_CHANGE_01',
    MSG_SELECT_CHANGE_01 : 'MSG_SELECT_CHANGE_01'
  };

  function expandCollapse(sender, e) {
      var list = sender.nextElementSibling.classList;
      if(list.contains('w3-hide')){
        list.remove('w3-hide');
        sender.querySelector('i').classList.remove('fa-caret-down');
        sender.querySelector('i').classList.add('fa-caret-up');
      } else {
        list.add("w3-hide");
        sender.querySelector('i').classList.remove('fa-caret-up');
        sender.querySelector('i').classList.add('fa-caret-down');
      }
  }

  function requestData(sender, e) {
      var list = sender.parentNode.parentNode.previousElementSibling;
      var idMunicipio = sender.id.split('-')[1];
      pubsub.publish(MESSAGE.ON_CHANGE_MUNICIPIO, sender.textContent);
      expandCollapse(list);
  }

  function initSample(){


    var handlers = {
      expandCollapse : expandCollapse,
      requestData    : requestData,
      toItalic       : function(e, data, a, b, c, d){ e.innerHTML = '<i>{0}</i> {1} {2}'.format(data, a, b); },
      logTxt         : function(e, a, b){
        pubsub.publish(MESSAGE.ON_LOG_MESSAGE, '<br/>Change from txt: {0}'.format(e.value));
      },
      logCombo         : function(e, a, b){
        pubsub.publish(MESSAGE.ON_LOG_MESSAGE, '<br/>Change from select: {0}'.format(e.value));
      },
      logMessage : function(topic, e, b, c){
        core.$('log-container').appendChild(core.build('p', e.value));
        core.$('log-container').appendChild(core.build('p', JSON.stringify(arguments)));
      }
    }

    function init(){
      ui.addEventListeners(core.$('declarative-target'), handlers, {});
      pubsub.subscribe(MESSAGE.MSG_INPUT_CHANGE_01, handlers.logMessage);
      pubsub.subscribe(MESSAGE.MSG_SELECT_CHANGE_01, handlers.logMessage);
    }

    module.ajax.get('.//samples//declarative.html').then(function (txt) {
      var container = core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));
      init();
      core.include('https://www.w3schools.com/lib/w3codecolor.js')
          .then(function(){ setTimeout(w3CodeColor, 100); });
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

