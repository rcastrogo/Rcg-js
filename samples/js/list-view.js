
(function(module){

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

    var core = module.core;

    function init(){
      var lv = module.ui.createListView({
                      rowsPerPage  : 18,
                      container    : 'address-table-template',
                      infoTemplate : 'Direcciones: {0} elementos',
                      sorters      : [
                        function (item) { return item.__checked == true; },
                        'id',
                        'address.summary',
                        'address.province',
                        'address.town'
                      ],
                      onSearch : function (item, text) {
                        var target = item.id + ' ' +
                                      item.address.province + ' ' +
                                      item.address.town + ' ' +
                                      item.address.summary;
                        return target.toLowerCase().includes(text.toLowerCase());
                      }
                    })
                    .loadData(
                      BUILDING_DATA_SET
                    );
      lv.events.onInsert.add(function(){
        console.log('lv.events.onInsert');
      });
    }

    module.ajax.get('.//samples//list-view.html').then(function (txt) {
      var container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      module.core.include('.//js//list-view.js').then(init);
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

