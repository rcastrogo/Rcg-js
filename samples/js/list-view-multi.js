
(function(module){

  var core      = module.core,
      pubsub    = module.pubsub,
      templates = module.templates,
      ui        = module.ui,
      modals    = ui.modals;

  var BUILDING_DATA_SET = [
      {
          "id": "28000010145700022",
          "score": "315.78568",
          "address": {
              "province": "MADRID",
              "town": "MADRID",
              "number": "22",
              "summary": "CALLE CAL 22, 28041 MADRID MADRID",
              "street_type": "CALLE",
              "street_name": "CAL",
              "province_id": "28",
              "postal_code": "28041"
          },
          "technical_id": "28000010145700022",
          "type": "BUILDING"
      },
      {
          "id": "28000110145700022",
          "score": "313.7538",
          "address": {
              "province": "MADRID",
              "town": "ARGANDA",
              "number": "22",
              "summary": "CALLE CAL 22, 28500 ARGANDA MADRID",
              "street_type": "CALLE",
              "street_name": "CAL",
              "province_id": "28",
              "postal_code": "28500"
          },
          "technical_id": "28000110145700022",
          "type": "BUILDING"
      },
      {
          "id": "52000250101100022",
          "score": "312.32404",
          "address": {
              "province": "MELILLA",
              "town": "MELILLA",
              "number": "22",
              "summary": "CALLE CAL 22, 52003 MELILLA MELILLA",
              "street_type": "CALLE",
              "street_name": "CAL",
              "province_id": "52",
              "postal_code": "52003"
          },
          "technical_id": "52000250101100022",
          "type": "BUILDING"
      },
      {
          "id": "36000200421000022",
          "score": "310.147",
          "address": {
              "province": "PONTEVEDRA",
              "town": "A GUARDA",
              "number": "22",
              "summary": "CALLE CAL 22, 36780 A GUARDA PONTEVEDRA",
              "street_type": "CALLE",
              "street_name": "CAL",
              "province_id": "36",
              "postal_code": "36780"
          },
          "technical_id": "36000200421000022",
          "type": "BUILDING"
      },
      {
          "id": "32000410203200022",
          "score": "293.62048",
          "address": {
              "province": "OURENSE",
              "town": "BARBADÁS",
              "number": "22",
              "summary": "RUA A CAL 22, 32890 BARBADÁS OURENSE",
              "street_type": "RUA",
              "street_name": "A CAL",
              "province_id": "32",
              "postal_code": "32890"
          },
          "technical_id": "32000410203200022",
          "type": "BUILDING"
      },
      {
          "id": "08000213482400022",
          "score": "290.54938",
          "address": {
              "province": "BARCELONA",
              "town": "BEGUES",
              "number": "22",
              "summary": "CALLE CAL VIDU 22, 08859 BEGUES BARCELONA",
              "street_type": "CALLE",
              "street_name": "CAL VIDU",
              "province_id": "08",
              "postal_code": "08859"
          },
          "technical_id": "08000213482400022",
          "type": "BUILDING"
      },
      {
          "id": "02000550316700022",
          "score": "290.03513",
          "address": {
              "province": "ALBACETE",
              "town": "LIETOR",
              "number": "22",
              "summary": "CALLE CAL NUEVA 22, 02410 LIETOR ALBACETE",
              "street_type": "CALLE",
              "street_name": "CAL NUEVA",
              "province_id": "02",
              "postal_code": "02410"
          },
          "technical_id": "02000550316700022",
          "type": "BUILDING"
      },
      {
          "id": "08001503747800022",
          "score": "290.03513",
          "address": {
              "province": "BARCELONA",
              "town": "RUBÍ",
              "number": "22",
              "summary": "CALLE CAL GERRER 22, 08191 RUBÍ BARCELONA",
              "street_type": "CALLE",
              "street_name": "CAL GERRER",
              "province_id": "08",
              "postal_code": "08191"
          },
          "technical_id": "08001503747800022",
          "type": "BUILDING"
      },
      {
          "id": "08001430001600022",
          "score": "289.30148",
          "address": {
              "province": "BARCELONA",
              "town": "PUIG-REIG",
              "number": "22",
              "summary": "CALLE CAL BIEL 22, 08692 PUIG-REIG BARCELONA",
              "street_type": "CALLE",
              "street_name": "CAL BIEL",
              "province_id": "08",
              "postal_code": "08692"
          },
          "technical_id": "08001430001600022",
          "type": "BUILDING"
      },
      {
          "id": "08001113484900022",
          "score": "289.30148",
          "address": {
              "province": "BARCELONA",
              "town": "MOIA",
              "number": "22",
              "summary": "CALLE CAL QUINORE 22, 08180 MOIA BARCELONA",
              "street_type": "CALLE",
              "street_name": "CAL QUINORE",
              "province_id": "08",
              "postal_code": "08180"
          },
          "technical_id": "08001113484900022",
          "type": "BUILDING"
      },  {
          "id": "22001830046900002",
          "score": "11.65171",
          "address": {
              "province": "HUESCA",
              "town": "CALLEN",
              "number": "2",
              "summary": "CALLE BAJA 2, 22255 CALLEN HUESCA",
              "street_type": "CALLE",
              "street_name": "BAJA",
              "province_id": "22",
              "postal_code": "22255"
          },
          "technical_id": "22001830046900002",
          "type": "BUILDING"
      },
      {
          "id": "22001830049200005",
          "score": "11.65171",
          "address": {
              "province": "HUESCA",
              "town": "CALLEN",
              "number": "5",
              "summary": "CALLE ALTA 5, 22255 CALLEN HUESCA",
              "street_type": "CALLE",
              "street_name": "ALTA",
              "province_id": "22",
              "postal_code": "22255"
          },
          "technical_id": "22001830049200005",
          "type": "BUILDING"
      },
      {
          "id": "22001830049200006",
          "score": "11.65171",
          "address": {
              "province": "HUESCA",
              "town": "CALLEN",
              "number": "6",
              "summary": "CALLE ALTA 6, 22255 CALLEN HUESCA",
              "street_type": "CALLE",
              "street_name": "ALTA",
              "province_id": "22",
              "postal_code": "22255"
          },
          "technical_id": "22001830049200006",
          "type": "BUILDING"
      },
      {
          "id": "46002010003900005",
          "score": "11.633245",
          "address": {
              "province": "VALENCIA",
              "town": "CALLES",
              "number": "5",
              "summary": "CALLEJÓN SAN ROQUE 5, 46175 CALLES VALENCIA",
              "street_type": "CALLEJÓN",
              "street_name": "SAN ROQUE",
              "province_id": "46",
              "postal_code": "46175"
          },
          "technical_id": "46002010003900005",
          "type": "BUILDING"
      },
      {
          "id": "46002010003900007",
          "score": "11.633245",
          "address": {
              "province": "VALENCIA",
              "town": "CALLES",
              "number": "7",
              "summary": "CALLEJÓN SAN ROQUE 7, 46175 CALLES VALENCIA",
              "street_type": "CALLEJÓN",
              "street_name": "SAN ROQUE",
              "province_id": "46",
              "postal_code": "46175"
          },
          "technical_id": "46002010003900007",
          "type": "BUILDING"
      },
      {
          "id": "46002010003900009",
          "score": "11.633245",
          "address": {
              "province": "VALENCIA",
              "town": "CALLES",
              "number": "9",
              "summary": "CALLEJÓN SAN ROQUE 9, 46175 CALLES VALENCIA",
              "street_type": "CALLEJÓN",
              "street_name": "SAN ROQUE",
              "province_id": "46",
              "postal_code": "46175"
          },
          "technical_id": "46002010003900009",
          "type": "BUILDING"
      },
      {
          "id": "22001830049200004",
          "score": "11.59004",
          "address": {
              "province": "HUESCA",
              "town": "CALLEN",
              "number": "4",
              "summary": "CALLE ALTA 4, 22255 CALLEN HUESCA",
              "street_type": "CALLE",
              "street_name": "ALTA",
              "province_id": "22",
              "postal_code": "22255"
          },
          "technical_id": "22001830049200004",
          "type": "BUILDING"
      },
      {
          "id": "46002010003900006",
          "score": "11.571396",
          "address": {
              "province": "VALENCIA",
              "town": "CALLES",
              "number": "6",
              "summary": "CALLEJÓN SAN ROQUE 6, 46175 CALLES VALENCIA",
              "street_type": "CALLEJÓN",
              "street_name": "SAN ROQUE",
              "province_id": "46",
              "postal_code": "46175"
          },
          "technical_id": "46002010003900006",
          "type": "BUILDING"
      },
      {
          "id": "38001920764800003",
          "score": "11.546478",
          "address": {
              "province": "TENERIFE",
              "town": "CALLEJONES(VILLA DE MAZO)",
              "number": "3",
              "summary": "CALLE CALLEJONES 3, 38738 CALLEJONES(VILLA DE MAZO) TENERIFE",
              "street_type": "CALLE",
              "street_name": "CALLEJONES",
              "province_id": "38",
              "postal_code": "38738"
          },
          "technical_id": "38001920764800003",
          "type": "BUILDING"
      },
      {
          "id": "22001830032800005",
          "score": "11.536865",
          "address": {
              "province": "HUESCA",
              "town": "CALLEN",
              "number": "5",
              "summary": "CALLE MAYOR 5, 22255 CALLEN HUESCA",
              "street_type": "CALLE",
              "street_name": "MAYOR",
              "province_id": "22",
              "postal_code": "22255"
          },
          "technical_id": "22001830032800005",
          "type": "BUILDING"
      }
  ];

  function initSample(){

    var resizeGridSubscriptionId = 0;
    var views = {
      // ============================================================================
      // Vista lista de elementos
      // ============================================================================
      list : { 
        createContent : function(listView, items){
          var item_template = '<li data-id="{id}">' + 
                              '  {type} {id} {address.summary}' + 
                              '</li>';
          var content = '<div class="w3-padding">' +
                         '  <h2>Lista de elementos</h2>' +
                         '  <p>Elementos en la lista...</p>' +
                         '  <ul class="w3-ul">' +                        
                         items.reduce(function(html, item){
                              return html += item_template.format(item);
                           }, '') + 
                         '  </ul>' + 
                         '<div>';
          return content;
        }
      }, 
      // ============================================================================
      // Vista Grid
      // ============================================================================
      grid : { 
        createContent : function(listView, items){
          var item_template = '<div class="w3-third w3-padding">' + 
                              '  <div data-id="{id}" class="w3-padding">' + 
                              '    <h4>{id}</h4>' +
                              '    {address.summary}<br/>' +
                              '    {score|toNumber|toFixed,2|replace,.,&#44;}' +
                              '<div class="w3-border w3-round" style="padding:1px">' +
                              '  <div class="w3-blue w3-round" style="height:8px;width:{0}%"></div>' +
                              '</div>' +
                              '  </div>'+
                              '</div>';
          var header_header = '<div class="w3-padding">' +
                              '  <h2>Rejilla</h2>' +
                              '  <p>Elementos en la rejilla...</p>' +
                              '</div>';
          var header = core.build('div', header_header, true);
          content = items.map(function(item){
                      var percentage = (item.score.toNumber() / 1000) * 100;
                      return core.build('div',
                                        item_template.format(~~percentage, item),
                                        true);
                    });

          // =======================================================================================
          // Redimendionar elementos al hacerlo la ventana
          // =======================================================================================
          function __sync(){
            var elements = core.elements('[data-id]', listView.view);
            elements.map(function(e){ e.style.height = ''; });
            setTimeout(function(){
              var elements = core.elements('[data-id]', listView.view);
              var max = elements.map(function(e){ return e.clientHeight; });
              max = Math.max.apply(Math, max);
              elements.map(function(e){ e.style.height = '{0}px'.format(max); });
            }, 0);         
          }
          if(resizeGridSubscriptionId) pubsub.unsubscribe(resizeGridSubscriptionId);
          resizeGridSubscriptionId  = pubsub.subscribe(pubsub.TOPICS.WINDOW_RESIZE, __sync);
          setTimeout(__sync, 0);

          return [header].concat(content);
        }
      }, 
      // ============================================================================
      // Vista lista elementos agrupados
      // ============================================================================
      groups : { 
        createContent : function(listView, items){
          var header_template = '<div class="w3-padding">' +
                                '  <h2>Lista agrupada</h2>' +
                                '  <p>' + 
                                '    Lista de elementos agrupados...' + 
                                '    <button type="button" >Ordenar por id' + 
                                '   </button>' + 
                                '  </p>' +
                                '</div>';
          var group_template = '<div class="w3-padding">' + 
                               '  <div>{0}</div>' +
                               '</div>';
          var item_template = '<div data-id="{id}" class="w3-padding">' + 
                              '  {address.summary}' +
                              '</div>';
          var content = [core.build('div', header_template, true)];

          var btn = core.element('button', content[0]);
          btn.onclick = function(){ listView.orderBy(1); };

          var groups  = items.groupBy([function(item){return item.address.province; }]);
          Object.keys(groups)
                .forEach(function(g){
                   var node  = core.build('div', group_template.format(g), true);
                   var items = groups[g];
                   items.forEach(function(item){
                     node.appendChild(core.build('div', item_template.format(item), true));
                   });
                   content.push(node); 
                });
          setTimeout(function(){
            //listView.view.style.backgroundColor = '#FFAA44';
          }, 100);
          return content;
        }
      }, 
      // ====================================================================================================================
      // Vista tabla
      // ====================================================================================================================
      table : { 
        createContent : function(listView, items){
          var header_template = '<div class="w3-padding">' +
                                '  <h2>Tabla</h2>' +
                                '  <p>Lista de elementos en una tabla</p>' +
                                '</div>';
          var table_header_template = 
            '<div data-header-wrapper style="overflow: hidden; z-index:1; box-shadow: silver 3px 4px 26px 0px;top:0;left:0;right:0">' +
            '    <table data-header class="w3-table-all w3-border-0">' +
            '        <thead>' +
            '            <tr on-click="doSort()" class="js-dest-row">' +
            '                <th class="w3-hover-gray sorteable" style="width:1%;"></th>' +
            '                <th class="w3-hover-gray sorteable">Id</th>' +
            '                <th class="w3-hover-gray sorteable">Dirección</th>' +
            '                <th class="w3-hover-gray sorteable">Provincia</th>' +
            '                <th class="w3-hover-gray sorteable">Población</th>' +
            '            </tr>' +
            '        </thead>' +
            '    </table>' +
            '</div>';
          var table_template = 
            '<div data-rows-wrapper style="overflow-y:auto;position:absolute;top:40px;left:0;right:0;bottom:0;border-bottom:solid 1px silver;">' +
            '    <table data-rows class="w3-table-all w3-border-0">' +
            '        <tbody>' +
            '            <tr data-xbind data-xfor="item in visibleItems" id="row-{item.id}" class="js-info-row">' +
            '                <td data-xbind class="w3-border-right">' +
            '                    <input data-xbind="checked:fn.checked(@item)" type="checkbox" on-click="doAction(check-item,{index})" />' +
            '                </td>' +
            '                <td data-xbind on-click-bak="doAction(edit-row,{item.id})">{item.id}</td>' +
            '                <td data-xbind>{item.address.summary}</td>' +
            '                <td data-xbind>{item.address.province}</td>' +
            '                <td data-xbind>{item.address.town}</td>' +
            '            </tr>' +
            '        </tbody>' +
            '    </table>' +
            '</div>';
          var header       = core.build('div', header_template, true);
          var table_header = core.build('div', table_header_template, true)
          var table        = core.build('div', table_template, true)
          return {
            nodes : [
               //header,
               table_header,
               table
            ],
            notify : function(){
              listView.progress.observe(table);
            }
          }
        }
      },
      beforeAddEventListeners : function(listView, hanlers){
        // =================================================================================
        // Aquí se podrá cambiar el comportamiento del control:
        //   - Añadir y/o quitar botones
        //   - Modificar el aspecto del control
        //   - Acceder/almacenar/añadir manejadores (handlers)
        // =================================================================================

        listView.options.views = views;
        listView.viewMode = 'groups';

        // =================================================================================
        // Menú contextual de la vista
        // =================================================================================
        listView.view.oncontextmenu = function(e){
          var actions = [
            { text : 'Marcar', onclick : function(){ alert('Marcar'); }},
            { text : 'Seleccionar todo', onclick : function(){}},
            { text : '-' },
            { text : 'Organizar', onclick : function(){}},
            { text : '-' },
            { text : 'Cancelar' }
          ];
          ui.showContextMenu( { x : e.pageX, y : e.pageY }, actions);
          e.preventDefault();  
        };

        // =================================================================================
        // 1 - Cómo añadir un menú de acciones de la vista
        // =================================================================================
        hanlers.showHideMenu = function(button, mouseEvent, param1) {
          var names = listView.menu.classList;
          function close(){
            names.remove('w3-show');
            document.removeEventListener('click', close);
          }
          if(names.contains('w3-show'))
            close()          
          else{
            names.add('w3-show');
            setTimeout(function(){ document.addEventListener('click', close); }, 50);
          }       
        };
          
        // =================================================================================
        // 2 - Cómo ocultar todos los botones de vista
        // =================================================================================
        //core.elements('[data-list], [data-grid], [data-groups]', listView.header)
        //    .forEach(function(b){ b.remove();});
        //return;

        // =================================================================================
        // 3 - Cómo establecer el estilo del contenedor de elemetos
        // =================================================================================
        core.wrap(listView.view)
            .css({ border : 'none'})
            .css('backgroundColor', 'whiteSmoke')
            .css('borderTop', 'none');
        // =================================================================================
        // 4 - Cómo añadir un nuevo botón para la vista de tabla
        // =================================================================================
        var tableViewBtn = core.build(
              'div', 
              '<button class="w3-button w3-xlarge w3-left fa fa-table w3-border-right;" ' +
              '        style="padding: 7px 4px;" ' +
              '        title="Tabla" ' +
              '        on-click="doAction(view, table)" ' +
              '        on-publish="MESSAGE_VIEW_CHANGE:syncViewButtons(table)"> ' +
              '</button>',
              true);
        listView.header.insertBefore(
          tableViewBtn, 
          listView.header.firstElementChild
        );

      }
    };

    function init(container){
      var lv = ui.createListViewExt({
                rowsPerPage  : 18,
                infoTemplate : 'Direcciones: {0} elementos',
                sorters      : [
                  function (item) { return item.__checked == true; },
                  'id',
                  'address.summary',
                  function(item){ return item.address.province; },
                  'address.town'
                ],
                onSearch : function (item, text) {
                  var target = item.id + ' ' +
                               item.address.province + ' ' +
                               item.address.town + ' ' +
                               item.address.summary;
                  return target.toLowerCase().includes(text.toLowerCase());
                },
                beforeAddEventListeners : views.beforeAddEventListeners
              })
              .loadData(
                BUILDING_DATA_SET
              );
      lv.events.onInsert.add(function(sender, eventArgs){
        var callback = eventArgs;
        var item = {
          "id": "450000101457000AA",
          "score": "315.78568",
          "address": {
              "province": "TOLEDO",
              "town": "BUENAVENTURA",
              "number": "22",
              "summary": "CALLE CARRETERA, 442 BUENAVENTURA TOLEDO",
              "street_type": "CALLE",
              "street_name": "CAL",
              "province_id": "28",
              "postal_code": "28041"
          },
          "technical_id": "28000010145700022",
          "type": "BUILDING"
        }
        callback(item);

        ui.modals.success(
                   'Ya hay un elemento más', 
                   function(){ 
                     var layer = ui.dialogBuilder.showLayer(true);
                     setTimeout(function(){
                       layer.close(true);                           
                     }, 10000);                                
                   }
                 ).show();

      });
      lv.events.onDelete.add(function(sender, eventArgs){

        var targets = eventArgs.targets;
        var callback = eventArgs.result;

        var message = '¿Estás seguro de borrar los elementos seleccionados?';
        var title   = 'Eliminar direcciones';
        ui.modals.confirm(
                    message, title, 
                    function(dlg) {
                      callback('ok');
                      //return false;
                    }, 
                    function(dlg){
                      callback();
                      //return false;
                    })
                 .show();
               
      });

      lv.events.onEdit.add(function(sender, eventArgs){
        var dlg,
            target   = eventArgs.target,
            callback = eventArgs.result;

        function cancel(dlg){
          callback(target.item);
          //return false;
        }

        function accept(){
          target.item.address.summary += ' !'; 
          callback(target.item);
          dlg.close(true, true);
        }

        function createContent(dlg){
          return 'Elemento';
        }

        function configure(sender){
          dlg = sender
          dlg.btnAccept.disabled = false;
          dlg.btnAccept.onclick = accept;
        }

        modals.createDialog('Datos de la dirección', createContent, cancel, ['Grabar', 'Cerrar'])
              .configure(configure)
              .show();
      });

      container.appendChild(lv.element);
    }

    module.ajax.get('samples/list-view-multi.html').then(function (txt) {
      var container       = core.$('main-container'); 
      var sampleElement   = core.build('div', txt, false);
      container.innerHTML = '';
      container.appendChild(sampleElement);
      var sampleContainer = core.$('address-lv-container', sampleElement);
      core.include('js/list-view-ext.js')
          .then(function(){
            init(sampleContainer);          
          });
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
