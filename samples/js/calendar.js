
(function(module){
  
  var core      = module.core,
      ui        = module.ui,
      templates = module.templates,
      pubsub    = module.pubsub;

  var schedule;

  function initSample(){

    function init(){

      var container = core.$('calendar-container');
      var meses = [];
      var year  = new Date().getFullYear();
      var date = new Date();
      while(meses.length < 12){       
        date = new Date(year, meses.length, 1);
        var calendar = ui.createCalendar(date);
        calendar.onDateChange.add(function(sender, arg){
          console.log(sender, arg);
        });
        meses.push(calendar);
      }

      meses.map(function(calendar){
             var style = { float   : 'left', 
                           width   : 'calc(25% - 8px)', 
                           height  : 'calc(33% - 8px)',
                           border  : 'solid 0px gray',
                           margin  : '2px' };
             var div = core.build('div', { style : style });
             div.appendChild(calendar.element);
             container.appendChild(div);
           });

      pubsub.subscribe(pubsub.TOPICS.WINDOW_RESIZE, function(t, v){
        container.style.height = '{0}px'.format(document.firstElementChild.clientHeight - 120);  
      });
      container.style.height = '{0}px'.format(document.firstElementChild.clientHeight - 120);
    }

    module.ajax.get('samples/calendar.html').then(function (txt) {
      var container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      core.include('js/calendar.js', false)
          .then(init);  
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
