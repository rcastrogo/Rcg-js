// =====================================================================================
// ui.createListViewExt
// =====================================================================================
(function (module) {

  var LV_TEMPLATE = '';
  var core   = module.core,
      pubsub = module.pubsub,
      ui     = module.ui;

  var counter  = 0;

  var defaults = {
    sorters      : [],
    infoTemplate : '{0} Elementos',
    rowsPerPage  : 10,
    viewMode     : 'list',
    views        : {
      list : { createContent : defaultCreateContent},
      grid : { createContent : defaultCreateContent}
    },
    beforeAddEventListeners : function(listView, handlers){}
  }

  function defaultCreateContent(lview, items){
    return items.reduce(function(acc, item){
                    acc += '<div class="no-view">{0}</div>'.format(JSON.stringify(item));
                    return acc;
                  }, '');
  }

  function createListView(o) {

    var header, view, menu, footer, resizeSubscriptionId = 0;
    var options = core.apply({}, o, defaults);
    var items   = [], data = [];
    var desc    = false, sortBy = options.sorters[1] || '';
    var paginationInfo = ui.paginate([], 1, 1, '');

    var sharedFunctions = {
      doAction    : function (sender, event, name, data) { doAction({ name: name, data: data }); },
      doGoToPage  : function (sender, event, name, data) { doAction({ name: 'page', data: sender.value }); },
      doSearch    : function (sender, event, name, data) { doAction({ name: 'search', data: sender.value }); },
      doSort      : function (sender, event, name, data) { doSort(options.sorters[event.target.cellIndex] || ''); },
      checked     : function (sender, item, b) { return item.__checked ? 'checked' : ''; },
      syncViewButtons: function (e, value, target) {
        e.classList.remove('w3-grey');
        if (value == target){
          e.classList.add('w3-grey');
          footer.innerHTML = value;
        }
      }
    }

    var progress = { 
      bar      : '',
      element  : '',
      setValue : function(value) {
        this.bar.style.width = value + "%";
      },
      update : function(element){
        var top = element.scrollTop;
        var height = element.scrollHeight - element.clientHeight;
        var value = top ? ((top / height) * 100) : 0;
        this.setValue(value);
      },
      observe : function(element){
        var that = this;
        (function(){
          element.onscroll = ui.debounce(function(e){
            that.update(this);
          }, 10 );        
        }());
      }
    }

    function init() {
      var element = core.build('div', core.$('listview-ext-template').innerHTML); //core.build('div', LV_TEMPLATE);
      listViewControl.element  = element;
      listViewControl.header   = header = core.element('[data-header]', element);
      listViewControl.view     = view   = core.element('[data-view]', element);
      listViewControl.menu     = menu   = core.element('[data-menu]', element);
      listViewControl.footer   = footer = core.element('[data-footer', element);
      listViewControl.progress = progress;
      progress.bar             = core.element('[data-progress-bar]', element);
      progress.element         = progress.bar.parentNode;
      progress.observe(view);
      // ==================================================================
      // Posibilitar la personalización del control
      // ==================================================================
      delete options.viewMode;
      if(options.beforeAddEventListeners) 
        options.beforeAddEventListeners(listViewControl, sharedFunctions);
      // ==================================================================
      // Añadir controladores de eventos de los elementos de la UI
      // ==================================================================
      var context = { MESSAGE_VIEW_CHANGE : MESSAGE_VIEW_CHANGE };
      ui.addEventListeners(element, sharedFunctions, context);       
      pubsub.publish(MESSAGE_VIEW_CHANGE, listViewControl.viewMode);

      return listViewControl;
    };

    function loadData(values) {
      syncTitle();
      items = data = (values || data || []);
      if(options.sorters && options.sorters[1]){
        desc = true;
        doSort(options.sorters[1] || '');
      } else {
        goToPage('first');
      }
      return listViewControl;
    };

    function goToPage(page) {
      var target = ~~page;
      if (page === 'current') target = paginationInfo.currentPage;
      if (page === 'first') target = 1;
      if (page === 'last') target = paginationInfo.totalPages;
      if (page === 'previous') target = Math.max(paginationInfo.currentPage - 1, 1);
      if (page === 'next') target = Math.min(paginationInfo.totalPages, paginationInfo.currentPage + 1);
      listViewControl.paginationInfo = paginationInfo = ui.paginate(items, target, options.rowsPerPage, '');
      syncView();
      return listViewControl;
    }

    function syncView() {
      syncTitle();
      syncContent();
    };

    function syncTitle() {
      var total = paginationInfo.totalItems;
      var selected = paginationInfo.getCheckeds().length;
      var template = options.infoTemplate.format(total);
      var template_s = ' ({0} seleccionados)'.format(selected);
      if (selected)
        paginationInfo.title = template + template_s;
      else
        paginationInfo.title = template;
      module.templates.fillTemplate(header, paginationInfo);
    };

    function syncContent(){
      view.innerHTML = '';
      if(paginationInfo.allItems.length){
        var items   = paginationInfo.visibleItems;
        var currentView = options.views[listViewControl.viewMode];
        var fn = currentView ? currentView.createContent : defaultCreateContent;
        var content = fn(listViewControl, items);
        if(core.isString(content))
          view.innerHTML = content;
        else if (core.isArray(content))
          content.forEach(function(node){ view.appendChild(node); });
        else if (core.isObject(content) && content.nodes){
          content.nodes.forEach(function(node){ view.appendChild(node); });    
          paginationInfo.fn = sharedFunctions;
          templates.fillTemplate(view, paginationInfo, true);
          ui.addEventListeners(view, sharedFunctions, {});
          syncColumnsHeaders(view);
          if(content.notify) content.notify();
        }
        else
          view.appendChild(content);
        // ====================================================================
        // Selección de elementos / Doble click
        // ====================================================================
        var ui_items = core.elements('[data-id]', view);
        if(ui_items){
          ui_items.forEach(function(element, i){
            if(items[i].__checked) element.classList.add('selected');
            element.onclick = ui.debounce(function(e){
              if(e.detail === 1)
                doAction({ name : 'check-item', data : i, element : element });
            }, 300);
            element.ondblclick = function(){
              items[i].__checked = true;
              element.classList.add('selected');
              doAction({ name : 'edit-row', data : items[i].id });
            }
          });
        }
      }
      progress.update(listViewControl.view);
    }

    function syncColumnsHeaders(view){
      var header_wrapper = view.querySelector('[data-header-wrapper]');
      var header_table   = header_wrapper.querySelector('table');
      var rows_wrapper   = view.querySelector('[data-rows-wrapper]');
      var rows_table     = rows_wrapper.querySelector('table');
      var firstRow       = core.$('tr.js-info-row', rows_table)[0];

      function syncHeadercontainer(){
        header_wrapper.style.marginLeft = '-{0}px'.format(this.scrollLeft);
      }

      function __sync(){
        if(firstRow){
          var width = rows_wrapper.offsetWidth - rows_wrapper.clientWidth;
          header_table.style.width = '{0}px'.format(rows_table.clientWidth + width); 
          var target = core.$('th', header_table);       
          core.toArray(firstRow.cells).forEach(function(td, i){
            if((i == target.length - 1) && scroll)
                target[i].style.width = '{0}px'.format(td.clientWidth + width);    
            else
                target[i].style.width = '{0}px'.format(td.clientWidth);  
          });
        }
      }
      if(resizeSubscriptionId) pubsub.unsubscribe(resizeSubscriptionId);
      resizeSubscriptionId  = pubsub.subscribe(pubsub.TOPICS.WINDOW_RESIZE, __sync);
      rows_wrapper.onscroll = ui.debounce(syncHeadercontainer, 70);
      __sync();
    }

    function goToPageOf(target) {
      var index = items.indexOf(target);
      if (index > -1) {
        var page = Math.floor(index / paginationInfo.pageSize);
        goToPage((page + 1).toString());
      }
    };

    function doSort(field) {
      if (sortBy && sortBy == field)
        desc = !desc;
      else
        desc = false;
      sortBy = field;
      items = items.sort(core.simpleSorter(field, desc));
      goToPage('first');
    };

    function orderBy(index){
      doSort(options.sorters[index] || '');
    }

    function doAction(value) {
      var target;
      if (value.name === 'page') return goToPage(value.data);
      if (value.name === 'first' ||
          value.name === 'previous' ||
          value.name === 'next' ||
          value.name === 'last') return goToPage(value.name);
      if (value.name === 'check-item') {
        target = paginationInfo.visibleItems[value.data];
        target.__checked = !target.__checked;
        if(value.element && target.__checked)  value.element.classList.add('selected');
        if(value.element && !target.__checked) value.element.classList.remove('selected');
        return syncTitle();
      }
      if (value.name === 'search') {
        if (value.data && options.onSearch) {
          items = data.where(function (item) { return options.onSearch(item, value.data); });
          return goToPage('first');
        }
        return loadData();
      }
      if (value.name === 'delete') return doDelete();
      if (value.name === 'new')    return doInsert();
      if (value.name === 'edit') {
          target = paginationInfo.getCheckeds()[0];
          return target && doEdit(target);
      }
      if (value.name === 'edit-row') {
        target = data.where({ id: value.data })[0];
        target && doEdit(
          { 
            index : data.indexOf(target),
            item  : target 
          });
        return;
      }
      if (value.name === 'view') {
        if(listViewControl.viewMode != value.data){
          listViewControl.viewMode = value.data;
          goToPage('current');
          pubsub.publish(MESSAGE_VIEW_CHANGE, listViewControl.viewMode);
        }
        return;
      }
      if (value.name === 'select-all') {
        data.forEach(function(item){ item.__checked = true; });
        return goToPage('current');
      }
    };

    function doDelete(){
      var targets = paginationInfo.getCheckeds();
      var eventArgs = { 
        targets : targets,
        result  : function(result){
          if(result && result == 'ok'){
            targets.forEach(function(t, i){
              items.remove(targets[i].item);              
            });
            goToPage('current');  
          }   
        }
      };  
      if(targets.length > 0){
        var event = listViewControl.events.onDelete; 
        event.dispatch(eventArgs);
      }
    };

    function doInsert() {
      var eventArgs = function(item){
        items.push(item); 
        if(sortBy){
          desc = false;
          items = items.sort(core.simpleSorter(sortBy, desc));
        }
        goToPageOf(item);
        if(item.id){
          var selector = '[data-id="{0}"]'.format(item.id);
          var element = core.element(selector, view);
          if(element){
            element.scrollIntoView({ block: "center", behavior: "smooth" }); 
            var old = element.style.backgroundColor;
            element.style.backgroundColor = 'silver';
            setTimeout(function(){
              element.style.backgroundColor = old;
            }, 1000);
          }
        }
      }
      var event = listViewControl.events.onInsert;
      event.dispatch(eventArgs);
    }

    function doEdit(target) {
      var eventArgs = { 
        target : target,
        result : function(result) {
          if(result && result == target.item) 
           setTimeout(function(){ goToPage('current'); }, 200);             
        }
      }
      var event = listViewControl.events.onEdit;
      event.dispatch(eventArgs);
    }

    var listViewControl = { 
          id       : ++counter,
          viewMode : options.viewMode,
          init     : init,
          loadData : loadData,
          goToPage : goToPage,
          orderBy  : orderBy,
          options  : options,
          paginationInfo : paginationInfo
        },
        MESSAGE_VIEW_CHANGE = 'lv_ext__view_change_{0}'.format(listViewControl.id)

    listViewControl.events = {
      onInsert : new module.events.Event(listViewControl),
      onDelete : new module.events.Event(listViewControl),
      onEdit   : new module.events.Event(listViewControl)
    }

    return init();

  }

  module.ui = module.ui || {};
  module.ui.createListViewExt = createListView;

}(window[___ROOT_API_NAME]));