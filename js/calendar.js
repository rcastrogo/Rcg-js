(function(module){

  var core   = module.core,
      ui     = module.ui
      events = module.events;

  var MonthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var DaysNames   = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo' ];
  var DaysNames2  = ['L', 'M', 'X', 'J', 'V', 'S','D'];
  var DaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];  
  var template    = '<div class="cal-wrapper">' +
                    '  <div class="cal-overlay-0">' +
                    '  <div class="cal-header">' +
                    '          <table>' +
                    '          <tbody>' +
                    '              <tr>' +
                    '                  <td class="cal-prev"> &lt; </td>' +
                    '                  <td class="cal-label"></td>' +
                    '                  <td class="cal-next"> &gt; </td>' +
                    '              </tr>' +
                    '          </tbody>' +
                    '      </table>' +
                    '  </div>' +
                    '  <div class="cal-body">' +
                    '      <table class="cal-table">' +
                    '          <tbody>' +
                    '              <tr class="cal-row-header"><th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th></tr>' +
                    '          </tbody>' +
                    '      </table>' +
                    '  </div>' +
                    '  <div class="cal-footer"></div>' +
                    '  </div>' +
                    '  <div class="cal-overlay-1"></div>' +
                    '</div>';
  var counter = 0;
  
  function create(date, id){

    var element = core.build('div', template, true);
    var refs = {
      tbody     : core.element('.cal-table tbody', element), 
      prev      : core.element('.cal-prev', element), 
      next      : core.element('.cal-next', element), 
      label     : core.element('.cal-label', element), 
      rowHeader : core.element('.cal-row-header', element),
      overlayCero : core.element('.cal-overlay-0', element),
      overlayOne  : core.element('.cal-overlay-1', element)
    };

    var current;
    var control = {
      element  : element,
      date     : date,
      controls : refs,
      id       : id || 'calendar-{0}'.format(++counter),
      setDate  : function(date){ 
        this.date = date;
        fillDays(date, refs, this);
        ui.addEventListeners(refs.label, handlers, {});
      },
      setCurrent : function(target){
        if(current) current.classList.remove('current');
        current = target;
        current.classList.add('current');
      }
    };
    control.onDateChange = new events.Event(control)

    var handlers = {
      chooseMonth : function(){ 
        var base = refs.label.dataset.month;
        refs.overlayCero.style.visibility = 'hidden';
        refs.overlayOne.style.display = 'flex'
        refs.overlayOne.innerHTML = MonthsNames.reduce(function(html, m, i){
          html += '<button class="cal-month{2}" data-month="{1}">{0}</button>'
                         .format(m, 
                                 i, 
                                 i == base ? ' current' 
                                           : '');
          return html;
        }, '');
        refs.overlayOne.onclick = function(e){
          var month = e.target.dataset.month;
          if(month != undefined){
            fillDays(new Date(refs.label.dataset.year, month, 1), control);
            ui.addEventListeners(refs.label, handlers, {});
          }
          refs.overlayCero.style.visibility = 'visible';
          refs.overlayOne.style.display = 'none';
        }
      },
      chooseYear  : function(){
        var base = refs.label.dataset.year;
        refs.overlayCero.style.visibility = 'hidden';
        refs.overlayOne.style.display = 'flex'
        var html = '<button class="cal-year" data-page-down>&lt;</button>';
        var count = 0;
        while(count < 18){
          var year = base - 9 + ++count;
          html += '<button class="cal-year{1}" data-year="{0}">{0}</button>'
                    .format(year, 
                            year == base ? ' current' 
                                         : '' );
        }
        html += '<button class="cal-year" data-page-up>&gt;</button>';
        refs.overlayOne.innerHTML = html;
        refs.overlayOne.onclick = function(e){
          var year  = e.target.dataset.year;
          if(year != undefined){
            fillDays(new Date(year, refs.label.dataset.month, 1), control);
            ui.addEventListeners(refs.label, handlers, {});
          }
          else if(e.target.dataset.pageUp != undefined)
            return handlers.refreshButtons(18, base);
          else if(e.target.dataset.pageDown != undefined)
            return handlers.refreshButtons(-18, base);

          refs.overlayCero.style.visibility = 'visible';
          refs.overlayOne.style.display = 'none';
        }
      },
      refreshButtons : function(offset, current){
        core.elements('button', refs.overlayOne)
            .where(function(button){ return button.dataset.year != undefined; })
            .map(function(button, i){                     
                button.dataset.year = ~~button.dataset.year + offset;
                button.textContent  = button.dataset.year;
                button.style.fontWeight = button.dataset.year == current ? 'bold' : 'normal';
            });
      }
    };

    refs.tbody.onclick = function(e){
      var target = e.target.classList.contains('cal-day') ? e.target : e.target.parentNode;
      if( target && target.classList.contains('cal-day')){
        control.setCurrent(target);
        control.date = target.Date;
        control.onDateChange.dispatch(control.date);
      }
    }

    refs.prev.onclick = function(){
      var year = ~~refs.label.dataset.year;
      var month = ~~refs.label.dataset.month;
      fillDays(new Date(year, month - 1, 1), control);
      ui.addEventListeners(refs.label, handlers, {});
    };

    refs.next.onclick = function(){
      var year = ~~refs.label.dataset.year;
      var month = ~~refs.label.dataset.month;
      fillDays(new Date(year, month + 1, 1), control);
      ui.addEventListeners(refs.label, handlers, {});
    };

    fillDays(date, control);
    ui.addEventListeners(refs.label, handlers, {});

    return control;

  }
    
  function fillDays(date, control){

    function createRowSeparator(){
      return core.build('tr', { className : 'cal-line', innerHTML : '<td colspan="7"></td>' } );
    }

    var month = date.getMonth(),
        year  = date.getFullYear(),
        refs  = control.controls; 
    // ====================================================================================================
    // Cabecera
    // ====================================================================================================
    var template = '<span on-click="chooseMonth()">{0}</span>, <span on-click="chooseYear()">{1}</span>';
    refs.label.innerHTML = template.format(MonthsNames[month], year, month);
    refs.label.dataset.year = year;
    refs.label.dataset.month = month;
    // ====================================================================================================
    // Días de la semana
    // ====================================================================================================
    refs.tbody.innerHTML = '';
    var row = refs.rowHeader.cloneNode(true);
    core.$('th', row).map(function(cell, i) { cell.textContent = DaysNames2[i]; });
    refs.tbody.appendChild(row);
    refs.tbody.appendChild(createRowSeparator());
    // ====================================================================================================
    // Días del mes
    // ====================================================================================================
    var monthLength = DaysInMonth[month];
    if ((month == 1) && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)) monthLength = 29;    
    var startingDay = new Date(year, month, 1).getDay();
    startingDay = (startingDay == 0) ? 7 : startingDay;

    var tempDate = new Date(year, month, 0); 
    var dayA = tempDate.getDate();
    dayA     = ++dayA - startingDay;     
    var firstDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), dayA + 1);            
    var lastDate  = new Date(firstDate.getFullYear(), firstDate.getMonth(), dayA + 42); 
    var day  = 1;
    var day2 = 1;
    var append;
    for (var i = 0; i < 6; i++) {
      var row = document.createElement("tr"); 
      append = false;
      for (var j = 1; j <= 7; j++) {
        cell = document.createElement("td");         
        if (day <= monthLength && (i > 0 || j >= startingDay)) {
          cell.Date = new Date(year, month, day);
          cell.id = 'day_{0}'.format(cell.Date.format());      
          cell.className = "cal-day";          
          cell.appendChild(core.build('span', '' + day++));
          append = true;          
        }
        else {
          cell.Date = (day >= monthLength) ? new Date(lastDate.getFullYear(), month + 1, day2)
                                           : new Date(firstDate.getFullYear(), firstDate.getMonth(), dayA + 1);
          cell.id = 'day_{0}'.format(cell.Date.format());
          cell.className = "cal-day-disabled";          
          cell.appendChild(core.build('span', '' + (day >= monthLength) ? day2++ : ++dayA));  
          //cell.appendChild(core.build('<span>{1}</span>'.format( 
          //                                          MonthsNames[cell.Date.getMonth()].substr(0,3),
          //                                          (day >= monthLength) ? day2++ : ++dayA)));  
        }
        if(cell.Date.format() == control.date.format()){
          control.setCurrent(cell);
        }
        row.appendChild(cell);
      }
      if (append){
        refs.tbody.appendChild(row);
        if(control.separatedRows) refs.tbody.appendChild(createRowSeparator());
      }
    }            
  }

  module.ui = module.ui || {};
  module.ui.createCalendar = create;

})(window[___ROOT_API_NAME]);

