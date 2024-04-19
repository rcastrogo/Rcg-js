(function(module){

  var core   = module.core,
      ui     = module.ui,
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
                    '                  <td tabindex="0" class="cal-prev" on-click="previous()"> &lt; </td>' +
                    '                  <td class="cal-label">' +
                    '                     <span tabindex="0" on-click="chooseMonth()"></span>, ' + 
                    '                     <span tabindex="0" on-click="chooseYear()"></span>' +
                    '                  </td>' +
                    '                  <td tabindex="0" class="cal-next" on-click="next()"> &gt; </td>' +
                    '              </tr>' +
                    '          </tbody>' +
                    '      </table>' +
                    '  </div>' +
                    '  <div class="cal-body">' +
                    '      <table class="cal-table">' +
                    '          <tbody>' +
                    '              <tr class="cal-row-header"><th>L</th><th>M</th><th>X</th><th>J</th><th>V</th><th>S</th><th>D</th></tr>' +
                    '              <tr class="cal-line"><td colspan="7"></td></tr>' +
                    '          </tbody>' +
                    '      </table>' +
                    '  </div>' +
                    '  <div class="cal-footer"></div>' +
                    '  </div>' +
                    '  <div class="cal-overlay-1"></div>' +
                    '</div>';
  var counter = 0;
  var defaults = {
    handleTab      : false,
    showSeparators : false,
    focusDay       : new Date(),
    selectedDay    : new Date(0, 0, 1)
  }
  
  function create(o){

    var current;
    // ====================================================================================
    // Elementos de la interfaz
    // ====================================================================================
    var element = core.build('div', template, true);
    var refs = {
      element     : element,
      tbody       : core.element('.cal-table tbody', element), 
      htbody      : core.element('.cal-header tbody', element),
      prev        : core.element('.cal-prev', element), 
      next        : core.element('.cal-next', element), 
      label       : core.element('.cal-label', element), 
      days        : [],
      rowHeader   : core.element('.cal-row-header', element),
      overlayCero : core.element('.cal-overlay-0', element),
      overlayOne  : core.element('.cal-overlay-1', element)
    };
    // ====================================================================================
    // Objeto Calendar
    // ====================================================================================
    var control = core.apply({}, o, defaults);
    core.apply(control, {
      element  : element,
      controls : refs,
      id       : control.id || 'calendar-{0}'.format(++counter),
      appendTo : function(parent){ 
        parent.appendChild(element); 
        return this; 
      },
      setDate  : function(value){ 
        this.selectedDay = value;
        this.focusDay = value;
        updateGrid();
        setFocusDay();
        refs.overlayCero.style.visibility = 'visible';
        refs.overlayOne.style.display = 'none';
      },
      setCurrent : function(target){
        if(current) current.classList.remove('current');
        current = target;
        current.classList.add('current');
      },
      setFocus: function(){ setFocusDay(true); }
    });
    control.ondateChange = new events.Event(control);
    control.onmessage = new events.Event(control);
    // ====================================================================================
    // Botones de la cabecera
    // ====================================================================================
    var handlers = {
      previous : function(){
        moveToPreviousMonth();
        setFocusDay();
      },
      next : function(){
        moveToNextMonth();
        setFocusDay();
      },
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
            control.setDate(new Date(refs.label.dataset.year, month, 1));
            setFocusDay(true);
          }
          refs.overlayCero.style.visibility = 'visible';
          refs.overlayOne.style.display = 'none';
        }
        core.element('.current', refs.overlayOne).focus();
        refs.buttons = core.elements('button', refs.overlayOne);
      },
      chooseYear  : function(){
        var base = refs.label.dataset.year;
        refs.overlayCero.style.visibility = 'hidden';
        refs.overlayOne.style.display = 'flex'
        var html = '<button class="cal-year" data-page-down>&lt;</button>';
        var count = 0;
        while(count < 18){
          var year = base - 9 + ++count;
          html += '<button class="cal-year{2}" data-year="{0}">{1}</button>'
                    .format(year,
                            year.toString().slice(2), 
                            year == base ? ' current' 
                                         : '' );
        }
        html += '<button class="cal-year" data-page-up>&gt;</button>';
        refs.overlayOne.innerHTML = html;
        refs.overlayOne.onclick = function(e){
          var year  = e.target.dataset.year;
          if(year != undefined){
            control.setDate(new Date(year, refs.label.dataset.month, 1));
            handlers.chooseMonth();
            return;
            //setFocusDay(true);
          }
          else if(e.target.dataset.pageUp != undefined)
            return handlers.refreshButtons(18, base);
          else if(e.target.dataset.pageDown != undefined)
            return handlers.refreshButtons(-18, base);

          refs.overlayCero.style.visibility = 'visible';
          refs.overlayOne.style.display = 'none';
        }
        core.element('.current', refs.overlayOne).focus();
        refs.buttons = core.elements('button', refs.overlayOne);
      },
      refreshButtons : function(offset, current){
        refs.buttons
            .where(function(button){ return button.dataset.year != undefined; })
            .map(function(button, i){                     
                button.dataset.year = ~~button.dataset.year + offset;
                button.textContent  = button.dataset.year.slice(2);
                button.style.fontWeight = button.dataset.year == current ? 'bold' : 'normal';
            });
      }
    };
    ui.addEventListeners(refs.htbody, handlers, {});
    // ====================================================================================
    // Click tabla
    // ====================================================================================
    refs.tbody.onclick = function(e){
      var target = e.target.classList.contains('cal-day') ? e.target : e.target.parentNode;
      if(target && target.classList.contains('cal-day')){
        control.setCurrent(target);
        control.selectedDay = target.dataset.date.toDate();
        control.focusDay    = target.dataset.date.toDate();
        control.ondateChange.dispatch(control.selectedDay);
      }
    };
    // ====================================================================================
    // Creación del grid de los días
    // ====================================================================================
    (function(){
      var i = 0;
      var row;
      while(i < 42){
        if(i % 7 == 0){
          if(row) refs.tbody.appendChild(row);
          row = core.build('tr');
        }        
        row.appendChild(
          core.build('td', { className : 'cal-day', 
                             innerHTML : '<span>x</span>',
                             tabIndex  : -1 } ) 
        );
        i++;
      }
      refs.days = core.elements('.cal-day', refs.tbody);
    }());
    // ===============================================================================
    // Actualización del grid de los días
    // ===============================================================================
    function updateGrid(){

      function showhideRow(row, show){
        var value   = show ? '' : 'none';
        var nextRow = row.nextElementSibling;
        row.style.display = value;
        if(nextRow && nextRow.className == 'cal-line')
          nextRow.style.display = value;
      }

      var month = control.focusDay.getMonth(),
          year  = control.focusDay.getFullYear(); 
      // =============================================================================
      // Cabecera
      // =============================================================================
      refs.label.children[0].textContent = MonthsNames[month];
      refs.label.children[1].textContent = year;
      refs.label.dataset.year = year;
      refs.label.dataset.month = month;
      // =============================================================================
      // Obtener la primera fecha que mostrar
      // =============================================================================
      var lastDateOfPreviousMonth = new Date(year, month, 0); 
      var firtDateOfMonth = new Date(year, month, 1);
      var dayOfWeek = firtDateOfMonth.getDay() || 7;
      var firstDay = lastDateOfPreviousMonth.getDate() + 2 - dayOfWeek;      
      var firstDate = new Date(lastDateOfPreviousMonth.getFullYear(), 
                               lastDateOfPreviousMonth.getMonth(), firstDay);
      // =============================================================================
      // Actualizar los días del mes
      // =============================================================================
      refs.days.forEach(function(cell, i){
        var date = new Date(firstDate);
        date.setDate(date.getDate() + i);
        cell.dataset.date = date.format();
        cell.id = 'day_{0}'.format(date.format());
        cell.className = date.getMonth() != month ? 'cal-day-disabled' : 'cal-day';
        cell.innerHTML = '<span>{0}</span>'.format(date.getDate());

        if(control.selectedDay && date.format() == control.selectedDay.format()){
          control.setCurrent(cell);
        }
        // Ocultar filas con todos los días deshabilitados
        if ((i == 28 || i == 35) && cell.className == 'cal-day-disabled')
          showhideRow(cell.parentNode, false);          
        if ((i == 28 || i == 35) && cell.className == 'cal-day')
          showhideRow(cell.parentNode, true);
      });      
    }
      
    function changeMonth(date, numMonths) {

      function getDaysInMonth(year, month){ return new Date(year, month, 0).getDate(); }

      var isPrev = numMonths < 0;
      var numYears = Math.trunc(Math.abs(numMonths) / 12);
      numMonths = Math.abs(numMonths) % 12;
      var newYear  = isPrev ? date.getFullYear() - numYears : date.getFullYear() + numYears;
      var newMonth = isPrev ? date.getMonth() - numMonths  : date.getMonth() + numMonths;
      var newDate  = new Date(newYear, newMonth, 1);
      var daysInMonth = getDaysInMonth(newDate.getFullYear(), newDate.getMonth() + 1);
      control.lastDate = control.lastDate ? control.lastDate : date.getDate();
      if (control.lastDate > daysInMonth) {
        newDate.setDate(daysInMonth);
      } else {
        newDate.setDate(control.lastDate);
      }
      return newDate;
    }

    function moveFocusToPreviousDay()    { return moveFocusTo(-1); }
    function moveFocusToNextDay()        { return moveFocusTo(1); }
    function moveFocusToNextWeek()       { return moveFocusTo(7); }
    function moveFocusToPreviousWeek()   { return moveFocusTo(-7); }
    function moveFocusToFirstDayOfWeek() { 
      var day = [6,0,1,2,3,4,5][control.focusDay.getDay()]; 
      return moveFocusTo(-day); 
    }
    function moveFocusToLastDayOfWeek()  { 
      var day = [6,0,1,2,3,4,5][control.focusDay.getDay()];
      return moveFocusTo(6 - day); 
    }

    function moveToNextYear() {
      control.focusDay = changeMonth(control.focusDay, 12);
      updateGrid();
    }
    function moveToPreviousYear() {
      control.focusDay = changeMonth(control.focusDay, -12);
      updateGrid();
    }
    function moveToNextMonth() {
      control.focusDay = changeMonth(control.focusDay, 1);
      updateGrid();
    }
    function moveToPreviousMonth() {
      control.focusDay = changeMonth(control.focusDay, -1);
      updateGrid();
    }

    function moveFocusTo(days){
      var d = new Date(control.focusDay);
      d.setDate(d.getDate() + days);
      control.lastDate = d.getDate();
      moveFocusToDay(d);
      return false;
    }
    function moveFocusToDay(day) {
      var d = control.focusDay;
      control.focusDay = day;
      if (
        d.getMonth() != control.focusDay.getMonth() ||
        d.getFullYear() != control.focusDay.getFullYear()
      ) {
        updateGrid();
      }
      setFocusDay(true);
    }

    var focusedCell;
    function setFocusDay(flag) {
      focusedCell = '';
      refs.days.forEach(function(cell, i){
        cell.tabIndex = -1;
        if (cell.dataset.date == control.focusDay.format()) {
          focusedCell = cell;
          cell.tabIndex = 0;
          if (flag) {
            cell.focus();
          }
        }
      });
    }

    // Pulsaciones de teclas en el calendario
    refs.element.onkeydown = function(e){
        // Enter -> Fecha actual
        if ((e.keyCode == 13 || e.keyCode == 32) && focusedCell) {
          control.setCurrent(focusedCell);
          control.selectedDay = focusedCell.dataset.date.toDate();
          control.ondateChange.dispatch(control.selectedDay);
          return false;
        }       
        if (e.keyCode == 40) return moveFocusToNextWeek();     // Tecla Abajo       
        if (e.keyCode == 38) return moveFocusToPreviousWeek(); // Tecla Arriba    
        if (e.keyCode == 39) return moveFocusToNextDay();      // Tecla Derecha         
        if (e.keyCode == 37) return moveFocusToPreviousDay();  // Tecla Izquirda
        // PageUp
        if (e.keyCode == 33){
          if (event.shiftKey)
            moveToPreviousYear();
          else 
            moveToPreviousMonth();

          setFocusDay(true);
          return false;
        }
        // PageDown
        if (e.keyCode == 34){ 
          if (event.shiftKey)
            moveToNextYear();
          else 
            moveToNextMonth();
          setFocusDay(true);
          return false;
        }
        // Home
        if (e.keyCode == 36){ 
          return moveFocusToFirstDayOfWeek();
        }
        // 'End':
        if (e.keyCode == 35){ 
          return moveFocusToLastDayOfWeek();
        }
        if (e.keyCode == 27){
          control.onmessage.dispatch(e.keyCode);
          return false;
        }
        if (e.keyCode == 9){
          if(control.handleTab && refs.tbody.contains(event.srcElement)) return true; // Dejar que el control pierda el foco
          if(refs.label.contains(event.srcElement)) return true;
          if (event.shiftKey){
            if(refs.tbody.contains(event.srcElement)){
              refs.next.focus();
              return false;
            }
            if(event.srcElement === refs.prev){
              if(control.handleTab) return true; // Dejar que el control pierda el foco
              setFocusDay(true);
              return false;
            } 
            return true;
          }
          if(event.srcElement == refs.prev) return true;
          if(refs.tbody.contains(event.srcElement)) refs.prev.focus();
          if(event.srcElement === refs.next) setFocusDay(true);        
          return false;
        }
    }

    // Pulsaciones de teclas en los botones del calendario
    refs.htbody.onkeydown = function(e){
      if (e.keyCode == 9) return true;
      if (e.keyCode == 27) return true;
      if (e.keyCode == 13 || e.keyCode == 32 ) event.srcElement.click();
      if([37, 38, 39, 40].indexOf(e.keyCode) > -1) setFocusDay(true);
      event.preventDefault();
      event.cancelBubble = true;
      return false;
    }
    
    // Pulsaciones de teclas en el panel de selección de mes y año
    refs.overlayOne.onkeydown = function(e){
      event.cancelBubble = true;
      if (e.keyCode == 27){
        refs.overlayCero.style.visibility = 'visible';
        refs.overlayOne.style.display = 'none';
        return false;
      }
      if (e.keyCode == 9){
        if(e.srcElement == refs.buttons.lastItem() && e.shiftKey){
          refs.buttons[refs.buttons.lastItem() - 1].focus();
          return false;
        }
        if(e.srcElement == refs.buttons.lastItem()){
          refs.buttons[0].focus();
          return false;
        }
        if(e.srcElement == refs.buttons[0] && e.shiftKey){
          refs.buttons.lastItem().focus();
          return false;
        }
        return true;
      }
      if (e.keyCode == 13 || e.keyCode == 32){
        e.srcElement.click();
        return false;
      }
      return false;
    }
    
    updateGrid();

    return control;

  }  

  function attachCalendar(){

      var panel, calendar, current; 

      function isVisible(){ return panel.style.display != 'none'; }

      function mousedown(event){
        var target = event.srcElement;
        if(target === panel || panel.contains(target)) return;
        if(current && current == target){
          panel.style.display = isVisible() ? 'none' : 'block';
          return;
        }
        closePanel();
      }

      function closePanel(){
        panel.style.display = 'none';        
      }
      function closePanelAndFocus(){
        closePanel();
        current.dataset.cancel = 'S';
        current.focus();
      }

      function onselect(sender, date){
        current.value = date.format();
        closePanelAndFocus();
      }

      function onmessage(sender, msg){
        if(msg == 27) closePanelAndFocus();       
      }

      function onfocus(e){
        current = this;
        if(current.dataset.cancel == 'S'){
          current.dataset.cancel = '';
          return;
        }
        var pos = this.getBoundingClientRect();
        var left = pos.left + window.scrollX;
        var top  = pos.bottom + window.scrollY + 1;
        core.wrap(panel)
            .css('display', 'block')
            .css('left', '{0}px'.format(left))
            .css('top', '{0}px'.format(top));
        calendar.setDate(current.value.toDate() || new Date());
      }

      function initControl(e){
        if(!panel){
          panel    = core.build('div', { className : 'cal-txt-panel'});
          calendar = ui.createCalendar()
                       .appendTo(panel);
          calendar.ondateChange.add(onselect);
          calendar.onmessage.add(onmessage);
          document.body.appendChild(panel);
          document.addEventListener('mousedown', mousedown);
        }
        e.onfocus = onfocus;
        e.onkeydown = onkeydown;
      }

      function onkeydown(e) {
        // Ctrl|Shif + Enter -> Fecha actual
        if ((e.ctrlKey || e.shiftKey) && e.keyCode == 13) {
          this.value = new Date().format();
          return false;
        }
        if (e.keyCode == 40){
          if(!isVisible()) onfocus.apply(this);
          calendar.setFocus();
          return false;
        }
        if([8,  // Delete
            9,  // Tab
            27  // Escape
           ].indexOf(e.keyCode) > -1 && isVisible()) closePanel();
      }

      return function(args){
        var targets;
        if(core.isString(args)) targets = core.elements(args);        
        if(core.isArray(args))  targets = args;          
        if(!targets) targets = [args]; 
        targets.forEach(function(c){ initControl(c); });
      }

  }

  module.ui = module.ui || {};
  module.ui.createCalendar = create;
  module.ui.attachCalendar = attachCalendar();
  module.ui.monthsNames = MonthsNames;

})(window[___ROOT_API_NAME]);

