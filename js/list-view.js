
// =====================================================================================
// ui.ListView
// =====================================================================================
(function (module) {

  var core   = module.core;
  var pubsub = module.pubsub;
  var ui     = module.ui;

  var defaults = {
    sorters      : [],
    infoTemplate : '{0} Elementos',
    rowsPerPage  : 10
  }

  function createListView(o) {

    var options = core.apply({}, o, defaults);
    var items   = [], data = [], current = {};
    var header, tbody, tr_template, tbody, header_wrapper, rows_wrapper, header_table, rows_table;
    var desc   = false, sortBy = options.sorters[1] || '';
    var paginationInfo = module.ui.paginate([], 1, 1, '');

    var sharedFunctions = {
      doAction    : function (sender, event, name, data) { doAction({ name: name, data: data }); },
      doGoToPage  : function (sender, event, name, data) { doAction({ name: 'page', data: sender.value }); },
      doSearch    : function (sender, event, name, data) { doAction({ name: 'search', data: sender.value }); },
      doSort      : function (sender, event, name, data) { doSort(options.sorters[event.target.cellIndex] || ''); },
      checked     : function (sender, item, b) { return item.__checked ? 'checked' : ''; }
    }

    function init(container) {
      header = container.querySelector('[data-header]');
      header_wrapper = container.querySelector('[data-header-wrapper]');
      header_table   = header_wrapper.querySelector('table');
      rows_wrapper   = container.querySelector('[data-rows-wrapper]');
      rows_table     = rows_wrapper.querySelector('table');
      tbody          = rows_table.querySelector('tbody');
      tr_template    = tbody.querySelector('tr');
      tbody.removeChild(tr_template);
      module.ui.addEventListeners(container, sharedFunctions, {});
      pubsub.subscribe(pubsub.TOPICS.WINDOW_RESIZE, syncColumnsHeaders);    
      rows_wrapper.onscroll = ui.debounce(syncHeadercontainer, 70);
      return listViewControl;
    };

    function syncHeadercontainer(){
      header_wrapper.style.marginLeft = '-{0}px'.format(this.scrollLeft);
    }

    function loadData(values) {
      syncTitle();
      items = data = (values || data || []);
      doSort(options.sorters[1] || '');
      return listViewControl;
    };

    function goToPage(page) {
      var target = ~~page;
      if (page === 'current') target = paginationInfo.currentPage;
      if (page === 'first') target = 1;
      if (page === 'last') target = paginationInfo.totalPages;
      if (page === 'previous') target = Math.max(paginationInfo.currentPage - 1, 1);
      if (page === 'next') target = Math.min(paginationInfo.totalPages, paginationInfo.currentPage + 1);
      paginationInfo = module.ui.paginate(items, target, options.rowsPerPage, '');
      syncTable();
      return listViewControl;
    }

    function syncTable() {
      syncTitle();
      tbody.innerHTML = '';
      if(paginationInfo.allItems.length){
        tbody.appendChild(tr_template.cloneNode(true));
        paginationInfo.fn = sharedFunctions;
        module.templates.fillTemplate(tbody, paginationInfo, true);
        module.ui.addEventListeners(tbody, sharedFunctions, {});
      }
      syncColumnsHeaders();
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

    function syncColumnsHeaders(){
      var firstRow = core.$('tr.js-info-row', rows_table)[0];
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
          target = data.where({ id:  value.data })[0];
          return target && doEdit(target);
      }
    };

    function doDelete(target){

      var checkedItems = paginationInfo.getCheckeds();
      if(checkedItems.length == 0) return;

      var target = checkedItems[0].item;

      // TODO: Borrar de visibleItems
      data.remove(target);
      items.remove(target);

      goToPage('current');

      //DialogHelper.getWrapper('dialog-container')        
      //            .setTitle('Borrar proveedores')
      //            .setBody ('¿Está seguro de eliminar el proveedor seleccionado?')
      //            .show((dlg) => {
      //              this.proveedores.remove(__target);
      //              this.goToPage('current');
      //              dlg.close();
      //            });
    };

    function doInsert() {

      events.onInsert.dispatch('hola');

      console.log('doInsert');

      //this._dialog = this._dialog || core.$<HTMLElement>('proveedor-edit-dialog');
      //this.current = { _id: 0, _nif: '', _nombre: '', _descripcion: '', _fechaDeAlta: '' };

      //fillTemplate(this._dialog, this.current);

      //DialogHelper.getWrapper('dialog-container')
      //            .setTitle('Nuevo vehículo')
      //            .setBody(this._dialog)
      //            .disableClickOutside()
      //            .show((dlg) => {
  
      //              let __payload = {
      //                _id          : 0,
      //                _nif         : core.$<HTMLInputElement>('txt-nif').value,
      //                _nombre      : core.$<HTMLInputElement>('txt-nombre').value,
      //                _descripcion : core.$<HTMLInputElement>('txt-descripcion').value,
      //                _fechaDeAlta : ''
      //              };

      //              //this.apiService
      //              //    .post(__payload)
      //              //    .subscribe((result: Proveedor) => {
      //              let result = { _id : 56, _nif : 'aaaa', _nombre : 'rrr', _descripcion : 'rrr', _fechaDeAlta : '01/02/2020'};
      //              this.current = result;
      //              this.proveedores.push(result);
      //              this.paginationInfo.visibleItems.push(result)
      //              this._dialog.style.display = 'none';
      //              dlg.close();                                        
      //              this.proveedores = this.proveedores.sortBy(this._sortBy, this._desc);
      //              this.goToPageOf(result);
      //                  //},
      //                  //error => this.showError(error)
      //                  //);

      //            });
    
      //this._dialog.style.display = 'block';
    }

    function doEdit(target) {

      console.log('doEdit', target);

      //this._dialog = this._dialog || core.$<HTMLElement>('proveedor-edit-dialog')[0];
      //this.current = target;

      //DialogHelper.getWrapper('dialog-container')        
      //            .setTitle('Edición de proveedores')
      //            .setBody(this._dialog)
      //            .disableClickOutside()
      //            .init((dlg) => {
      //              fillTemplate(this._dialog, this.current);
      //            })
      //            .show((dlg) => {
 
      //              let __payload = {
      //                _id          : ~~ core.$<HTMLInputElement>('txt-id').value,
      //                _nif         : core.$<HTMLInputElement>('txt-nif').value,
      //                _nombre      : core.$<HTMLInputElement>('txt-nombre').value,
      //                _descripcion : core.$<HTMLInputElement>('txt-descripcion').value,
      //                _fechaDeAlta : ''
      //              };

      //              //this.apiService
      //              //    .put(__payload)
      //              //    .subscribe((result: Proveedor) => {
      //                    this.current._nif = __payload._nif;
      //                    this.current._nombre = __payload._nombre;
      //                    this.current._descripcion = __payload._descripcion;
      //                    this._dialog.style.display = 'none';
      //                    dlg.close();                                          
      //                  //},
      //                  //  error => this.showError(error)
      //                  //);
      //            });
      //this._dialog.style.display = 'block';

    }

    var events = {
      onInsert : new module.events.Event('ListView.onInsert')
    };

    var listViewControl = {
      init      : init,
      loadData  : loadData,
      goToPage  : goToPage,
      events    : events,
      element   : core.$(options.container)
    };

    return init(listViewControl.element);

  }

  module.ui = module.ui || {};
  module.ui.createListView = createListView;

}(window[___ROOT_API_NAME]));

//function init() {
//  var listView = createListView({
//      rowsPerPage  : 6,
//      container    : 'address-table-template',
//      infoTemplate : 'Direcciones: {0} elementos',
//      sorters      : [
//        function (item) { return item.__checked == true; },
//        'id',
//        'address.summary',
//        'address.province',
//        'address.town'
//      ],
//      onSearch : function (item, text) {
//        var target = item.id + ' ' +
//                      item.address.province + ' ' +
//                      item.address.town + ' ' +
//                      item.address.summary;
//        return target.toLowerCase().includes(text.toLowerCase());
//      }
//  });
//}
