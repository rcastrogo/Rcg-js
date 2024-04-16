(function(module){

  var core   = module.core,
      ajax   = module.ajax,
      ui     = module.ui;

  var TEMPLATE      = '<ul class="w3-ul w3-border w3-container rcg-list"></ul>',
      ITEM_TEMPLATE = '<li id="lst-item-{id} tabIndex="0">{text}</li>';

  function createList(){

    var list = core.build('div', TEMPLATE, true);
    var ctrl = {
      element   : list,
      appendTo  : function(parent){ parent.appendChild(list); return this; },
      selecteds : function(){ return core.elements('li.selected', list) },
      load      : function (data, template){
        list.innerHTML = data.reduce(function(s, e){
                                return s.append((template || ITEM_TEMPLATE).format(e));
                              }, [])
                              .join('');
        return this;
      },
      addEventListener : function(event, fn){ events['on' + event].add(fn); return this; }
    };
    var events = { onselectedChanged : new module.events.Event(ctrl) }
    list.onkeydown = function(e) {
      var curr = list.querySelector('li:focus')
          prev = curr && curr.previousElementSibling,
          next = curr && curr.nextElementSibling,
          key  = e.keyCode;
      if(key == 9) return;
      if(key == 38 && prev) prev.focus();
      if(key == 40 && next) next.focus();
      if((key == 13 || key == 32) && curr) curr.click();
      e.preventDefault();
    }
    list.onclick = function (e){
      if(e.srcElement.tagName === 'UL') return;
      var target = e.srcElement;
      while(target){
        if(target.tagName === 'UL') break;
        if(target.tagName === 'LI'){
          target.classList.toggle('selected');
          events.onselectedChanged
                .dispatch({ item     : target, 
                            selected : target.classList.contains('selected') 
                          });
          break;
        }
        target = target.parentNode;
      }
    }
      
    return ctrl;

  }

  function attachAutocomplete(target, data){

    var divs;
    var currentFocus = -1;
    var selectedIndex = -1;
    var items;
    var parent  = target.parentNode;
    var wrapper = core.build('div', { className : 'autocomplete' });
    var list;
    var filterfn;
    var textProvider;
    var dataSource = data;
    var ctrl = {
      wrapper   : wrapper,
      input     : target,
      addEventListener : function(event, fn){ 
        events['on' + event].add(fn); 
        return this; 
      },
      setDataSource : function(value){
        dataSource = value;
        return this;
      },
      setFilter : function(value){
        filterfn = value;
        return this;
      }
      ,
      setTextProvider : function(value){
        textProvider = value;
        return this;
      }
    }
    var events = { onselect : new module.events.Event(ctrl) }

    parent.insertBefore(wrapper, target);
    wrapper.appendChild(target);

    function closeList(){
      if(list){
        list.remove();
        list = '';
      }
      currentFocus = -1;
    }

    function createList(){
      closeList();
      list = core.build('div', { className : 'autocomplete-items' });
      wrapper.appendChild(list);
      list.onclick = function(e) {
        var el = e.srcElement
        selectedIndex = ~~ el.dataset.index;
        closeList();
        removeMousedownEventListener();
        target.value = el.textContent;
        target.focus();
        events.onselect.dispatch(items[selectedIndex]);
      };
    }

    function populateList(data){
      createList(); 
      list.innerHTML = data.reduce(function(html, item, i){ 
        var text = textProvider ? textProvider(item) : item.toString();
        return html += '<div data-index="{0}">{1}</div>'.format(i, text);
      }, '');
      if(selectedIndex == -1) document.addEventListener('mousedown', mousedown);
      divs = core.elements('div', list);
    }

    function removeMousedownEventListener(){
      document.removeEventListener('mousedown', mousedown);
    }

    function mousedown(event){
      if(event.srcElement === target) return;
      if(event.srcElement === list) return;
      if(event.srcElement.parentNode === list) return;
      closeList();
      removeMousedownEventListener();
    }

    function setActive() {
      if (divs && divs.length){
        divs.forEach(function(div){ div.classList.remove("autocomplete-active"); });
      }        
      if (currentFocus >= divs.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (divs.length - 1);
      divs[currentFocus].classList.add("autocomplete-active");
      divs[currentFocus].scrollIntoView({block: "nearest", inline: "nearest"});
    }

    function search(){        
      items = '';
      selectedIndex = -1;
      currentFocus = -1;
      closeList();
      if(target.value){
        if(core.isFunction(dataSource)){
          dataSource(target.value, function(data){
            if(data.length > 0) populateList(data);
            items = data;
          });           
        }
        else if(core.isString(dataSource)){
          ajax.get(dataSource.format(target.value))
              .then(function(res){
                var values = JSON.parse(res);
                if(values.length > 0) populateList(values);
                items = values;
              }); 
        }
        else if(core.isArray(dataSource)){
          var values = dataSource.where(function(item){ return filterfn(item, target.value); });
          if(values.length > 0) populateList(values);
          items = values;
        }
      }
    }

    target.onfocus = function(e){
      if(selectedIndex == -1 &&
          items               && 
          items.length > 0){
        populateList(items);
      } else if(target.value && selectedIndex == -1) {
        search();  
      }
      currentFocus = -1;
    }

    target.onkeydown = function(e) {
      if (e.keyCode == 9 || 
          e.keyCode == 27){
        closeList();
        removeMousedownEventListener();
      } else if(e.keyCode == 40){
        if(!list) target.onfocus();
        if(list){
          currentFocus++;
          setActive();
        }
      } else if (e.keyCode == 38) { 
        currentFocus--;
        setActive();
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) divs[currentFocus].click();
      }
    }

    target.oninput = ui.debounce(search, 350);
  
    return ctrl;

  }

  function attachComboBox(target, data){

    var id = target.id;
    var divs;
    var list;
    var selectedIndex = -1;
    var parent  = target.parentNode;
    var wrapper = core.build('div', { className : 'autocomplete combo-box' });
    var hidden  = core.element(id + '-value', parent);
    var resolver;
    var dataSource = data;
    var ctrl = {
      wrapper   : wrapper,
      input     : target,
      hidden    : hidden,
      getSelectedIndex : function(){ return selectedIndex; },
      setSelectedIndex : function(index){
        selectedIndex = index;
        select(dataSource[selectedIndex]);
        return this;
      },
      addEventListener : function(event, fn){ 
        events['on' + event].add(fn); 
        return this; 
      },
      setDataSource : function(value){
        dataSource = value;
        createList(dataSource);
        return this;
      },
      setResolver : function(value){
        resolver = value;
        return this;
      }
    }
    var events = { onselect : new module.events.Event(ctrl) }

    parent.insertBefore(wrapper, target);
    wrapper.appendChild(target);

    function closeList(){ 
      list.style.display = 'none'; 
      wrapper.classList.remove('open');
    }

    function showList(){ 
      list.style.display = 'block';
      wrapper.classList.add('open');
    }

    function listVisible(){ 
      return list.style.display == 'block'; 
    }

    function createList(data){
      if(!list){
        list = core.build('div', { className : 'autocomplete-items' });
        wrapper.appendChild(list);
        list.innerHTML = data.reduce(function(html, item, i){ 
          var text = !resolver ? item : item[resolver.text];
          var id   = !resolver ? item : item[resolver.id];
          return html += '<div id="{0}" data-index="{1}">{2}</div>'.format(id, i, text);
        }, '');

        divs = core.elements('div', list);
        document.addEventListener('mousedown', mousedown);
        closeList();

        list.onclick = function(e) {
          var el = e.srcElement;
          selectedIndex = ~~ el.dataset.index;
          closeList();
          select(dataSource[selectedIndex]);
          target.focus();
        };
        if(hidden){
          var cur = dataSource.item(resolver.id, hidden.value);
          if(cur){
            selectedIndex = dataSource.indexOf(cur);
            target.value = divs[selectedIndex].textContent;
          }
        } else{
          selectedIndex = dataSource.indexOf(target.value);
          if(selectedIndex > -1)
            target.value = divs[selectedIndex].textContent;
        }
      }
    }

    function select(data){
      target.value = !resolver ? data : data[resolver.text];
      if(hidden) hidden.value = data[resolver.id];
      events.onselect.dispatch(data);
    }

    function mousedown(event){
      if(event.srcElement === target){
        if(!listVisible()){
          showList();
          if(selectedIndex > -1) setActive();
          return;
        }
      }
      if(event.srcElement === list) return;
      if(event.srcElement.parentNode === list) return;
      closeList();
    }

    function resetActive() {
      if (divs && divs.length){
        divs.forEach(function(div){ div.classList.remove("autocomplete-active"); });
      }
    }

    function setActive(raise) {
      resetActive();     
      if (selectedIndex >= divs.length) selectedIndex = divs.length - 1;
      if (selectedIndex < 0) selectedIndex = 0;

      var div = divs[selectedIndex];
      div.classList.add("autocomplete-active");
      div.scrollIntoView({block: "nearest", inline: "nearest"});
      if(raise){
        select(dataSource[selectedIndex]);
      }
    }

    target.onkeydown = function(e) {
      if (e.keyCode == 9 || e.keyCode == 27){
        closeList();
      } else if(e.keyCode == 40){
        var raise = false;
        if(!listVisible()){
          showList();
        } else{
          selectedIndex++;
          raise = true;
        }
        setActive(raise);
        e.preventDefault();
      } else if (e.keyCode == 38) { 
        selectedIndex--;
        setActive(true);
        e.preventDefault();
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (selectedIndex > -1 && listVisible()) divs[selectedIndex].click();
      }
    }
  
    if(dataSource) createList(dataSource);

    return ctrl;

  }

  module.ui = module.ui || {};
  module.ui.createList         = createList;
  module.ui.attachAutocomplete = attachAutocomplete;
  module.ui.attachComboBox     = attachComboBox;

}(window[___ROOT_API_NAME]));