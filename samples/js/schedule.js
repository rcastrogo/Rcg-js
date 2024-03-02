
(function(module){
  
  var core      = module.core;
  var ui        = module.ui;
  var templates = module.templates;

  var schedule;

  function initSample(){

    function onMonthChanged(sender, date){
      onDayChanged(sender, sender.Date);
    }

    function onDayChanged(sender, date){
      sender.ClearDayView();
      sender.ClearAgendaView();
    }

    function init(data){

      schedule = ui.createSchedule( { Element        : core.element('schedule-container'), 
                                      View           : 'Month',
                                      OnMonthChanged : onMonthChanged,
                                      OnDayChanged   : onDayChanged,
                                      OnViewChanged  : function (sender, view) {
                                        //ctx.publish('msg\\this_page\\view\\changed', {});  
                                      }
                                    });
      schedule.Buttons.Month.innerHTML = '<i class="fa fa-calendar"></i>';
      schedule.Buttons.Agenda.innerHTML = '<i class="fa fa-bicycle"></i>';
      schedule.Buttons.Day.innerHTML = '<i class="fa fa-line-chart"></i>';
    }

    module.ajax.get('./samples/schedule.html').then(function (txt) {
      var container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      core.include('js/schedule.js')
          .then(init);  
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

//import pol from "../../lib/mapa.js";
//import {stravaApi, speedToWatts} from "../strava/strava"
//import {lineChart} from "../components/lineChart.component"
//import pageContainer from "../components/page.component";

//import HTML from "./page.txt";

//export default function (ctx) {
  
//  let pageWrapper = pageContainer(ctx);
//  let page        = {};
//  let schedule;
//  let summary     = {};
//  let viewDataSet;
//  let resizeSubcriptions = [];

//  let component   = {
//    root   : {},
//    init   : function(){ },
//    render : function(){
//      this.root = pageWrapper.render();
//      page = pol.build('div', HTML, 'firstElementChild');
//      this.root.appendChild(page);
//      return this.root;
//    },
//    mounted : function(){
//      initAll();
//    }
//  };

//  function initAll() {
//    ctx.publish('msg\\page_component\\update\\title', 'Strava - Resumen');
//    stravaApi.loadAthleteInfo()
//             .then( result => {
//               return stravaApi.activitiesSummary()
//                               .then(result => {
//                                  summary = result; 
//                                });
//             })
//             .then(() => {
//                pol.Include('./assets/js/schedule.js')
//                   .then(() => {
//                     schedule = Schedule({ Element        : page, 
//                                           View           : 'Month',
//                                           OnMonthChanged : onMonthChanged,
//                                           OnDayChanged   : onDayChanged,
//                                           OnViewChanged  : function (sender, view) {
//                                             ctx.publish('msg\\this_page\\view\\changed', {});  
//                                           }
//                                         });
//                     schedule.Buttons.Month.innerHTML = '<i class="fa fa-calendar"></i>';
//                     schedule.Buttons.Agenda.innerHTML = '<i class="fa fa-bicycle"></i>';
//                     schedule.Buttons.Day.innerHTML = '<i class="fa fa-line-chart"></i>';
//                     pageWrapper.addButton(schedule.Buttons.Day);
//                     pageWrapper.addButton(schedule.Buttons.Agenda);
//                     pageWrapper.addButton(schedule.Buttons.Month);
//                   });
//             });
//  }

//  function onMonthChanged(sender, date) {
//    // =====================================================================
//    // Obtener las actividades entre las fechas mostradas
//    // =====================================================================
//    let f1US = sender.FirstDate.format('yyyymmdd');
//    let f2US = sender.LastDate.format('yyyymmdd');

//    viewDataSet = Object.keys(summary.data)
//                         .where( d => {
//                           let dateUS = d.replaceAll('-', '/');
//                           return f1US <= dateUS && f2US >= dateUS; 
//                         })
//                         .map( d => {
//                           return { 
//                             fechaUS : d.replaceAll('-', '/'),
//                             ids     : summary.data[d].ids
//                           };
//                         });
//    sender.ClearMonthView();
//    // ==================================================================================
//    // Contenido mensual
//    // ==================================================================================
//    sender.LoadMonthView((() => {
//      return viewDataSet.reduce((nodes, daySummary) => {
//        let fechaES = daySummary.fechaUS
//                                .split('/')
//                                .reverse()
//                                .join('/');
//        nodes[fechaES] = [
//          pol.build('div', { 
//            innerHTML : daySummary.ids.length,
//            className : 'w3-badge w3-red w3-display-middle w3-large',
//            id        : 'activity_{0}'.format(fechaES),
//            onclick   : function(){ 
//              sender.ShowDayView(this.id.split('_')[1]);
//              sender.Buttons.Agenda.click();
//            }
//          })
//        ];
//        return nodes;
//      }, {});

//    })()); 
//    onDayChanged(sender, sender.Date);
//  }

//  var loadingPanel = pol.build( 'div', 
//    `<div class="w3-margin w3-white w3-border w3-round w3-animate-left">
//      <p class="w3-center" style="overflow:hidden;">
//        <i class="fa fa-2x fa-cog fa-spin"></i><br>Cargando...</p>
//     </div>`);

//  function onDayChanged(sender, date) {
//    let dateUS = date.format('yyyymmdd');
//    // =========================================================================
//    // Cargar los datos de las actividades del día
//    // =========================================================================
//    let promises = viewDataSet.where(summary => summary.fechaUS == dateUS)
//                              .reduce( (promises, summary) => {
//                                summary.ids.map( (id) => {
//                                  promises.push(stravaApi.loadActivity(id));
//                                  promises.push(stravaApi.loadActivityStream(id));
//                                });
//                                return promises;
//                              }, []);

//    sender.ClearDayView();
//    sender.ClearAgendaView();
//    sender.LoadDayView([loadingPanel.cloneNode(true)]);
//    sender.LoadAgendaView([loadingPanel.cloneNode(true)]);

//    Promise.all(promises).then( values => {
//      let activities = values.where( a => a.start_date)
//                             .map  ( a => {
//                               if (a.trainer && a.athlete.id == 8955526) {
//                                 a.average_watts = speedToWatts(a.average_speed * 3.6);
//                               }
//                               return a;
//                             });
//      // =======================================================================
//      // Contenido dia
//      // =======================================================================
//      sender.ClearDayView();
//      sender.LoadDayView((() => {

//        function minutesFromDate(time) {
//          let [horas, minutos] = time.fixTime('T').split(':');
//          return ~~horas * 60 + ~~minutos;
//        }

//        // =======================================================================
//        // Configurar hora de inicio y de fin la vista 
//        // =======================================================================
//        if (activities.length == 0) {
//          sender.ConfigureView({ min : 0, max : 24 * 60, step : 3 * 60 });
//        } else{
//          let view_options = activities.map( a => {
//                                  let start = minutesFromDate(a.start_date_local);
//                                  // =========================================
//                                  // Rango en minutos
//                                  // =========================================
//                                  a.chart = { 
//                                    start : start,
//                                    end   : start + ~~(a.elapsed_time / 60)
//                                  }
//                                  // =========================================
//                                  // Rango en horas
//                                  // =========================================                                
//                                  return { 
//                                    start : ~~(start/60), 
//                                    end   : Math.ceil(a.chart.end/60)
//                                  };
//                                })
//                                .reduce((a, value) => {
//                                  if(value.start < a.min) a.min = value.start;
//                                  if(value.end > a.max) a.max = value.end;
//                                  let diff = value.end - value.start;
//                                  if(diff <= 24) a.step = 120;
//                                  if(diff <= 12) a.step = 60;
//                                  if(diff <= 7) a.step = 30;
//                                  if(diff <= 3) a.step = 10;
//                                  if(diff <= 2) a.step = 5;
//                                  return a;
//                                }, { min : 24, max : 0, step : 30 });
//          sender.ConfigureView({ 
//            min  : view_options.min * 60,
//            max  : view_options.max * 60,
//            step : view_options.step
//          });
//        }
//        // ================================================================================
//        // Generación del array de HTMLElement
//        // ================================================================================
//        let d_template = require("./page.t.dia.txt");
//        let top        = -10;
//        return activities.reduce((nodes, activity, i) => {
//          // ===============================================================================
//          // Posición y tamaño de la actividad
//          // ===============================================================================
//          let start = minutesFromDate(activity.start_date_local);
//          let context = {
//            activity : activity,
//            top : '{0}px'.format(top += 60),
//            pos : sender.MeasureDayItem( { start : start, 
//                                           end   : start + ~~(activity.elapsed_time / 60) })
//          }
//          let element = pol.build('div', d_template.format(context), false);
//          pol.toArray(element.childNodes)
//                  .where( n => n.nodeType != 3)
//                  .map( node => {
//                    nodes.push(node);
//                  });

//          return nodes;
//        }, []);

//      })());

//      // ==========================================================================================================
//      // Crear las actividades del día
//      // ==========================================================================================================
//      sender.LoadAgendaView((() => {

//        sender.ClearAgendaView();

//        let html        = require("./page.t.agenda.txt");
//        let htmlElement = pol.build('div', html, true);

//        let context = {
//          athlete    : stravaApi.athlete,
//          activities : activities,
//          fn: {
//            toKilometers : meters => { return (meters / 1000).toLocaleString('es', { maximumFractionDigits: 2}); },
//            formatSpeed  : value => { return (value * 3.6).toLocaleString('es', { maximumFractionDigits: 2}); },
//            formatTime   : time => { return time.fixTime('T').replace('Z', ''); },
//            formatDuration : seconds => {
//              let h = Math.floor(seconds / 60 / 60);
//              let m = Math.floor(seconds / 60) % 60;
//              let s = Math.floor(seconds - m * 60) % 3600;
//              let tokens = ['{0}h '.format(h), '{0}min'.format(m), '{0}s'.format(s)];
//              if (h && m) return [tokens[0], tokens[1]].join(' ');
//              if (h && s) return [tokens[0], tokens[2]].join(' ');
//              if (m && s) return [tokens[1], tokens[2]].join(' ');
//              if (m) return tokens[1];
//              return tokens[0];
//            },
//            formatDate : time => {
//              let hoy = new Date().format(); // dd/mm/yyyy
//              let t   = time.fixDate('T')    // yyyy-mm-dd
//                            .split('-')
//                            .reverse()
//                            .join('/');
//              return hoy == t ? 'Hoy' : t;
//            },
//            showIf : (value, target, p)  => {
//              let v = value === window ? '' : value;
//              if(!v) target.style.display = 'none';
//            },
//            showIfGreather : (v1, v2, target) => {
//              let v = v1 === window ? 0 : v1;
//              if(~~v <= ~~v2) target.style.display = 'none';
//            },
//            formatId: (id, prefix, target) => {
//              return '{0}-{1}'.format(prefix, id);
//            },
//            googleStaticMapUrl: (activity) => {
//              return activity.map.polyline ? stravaApi.GOOGLE_STATIC_MAP.format(activity) 
//                                           : '';       
//            }
//          }
//        }

//        return pol.toArray(pol.templates.fill(htmlElement, context).childNodes)
//                  .where( n => n.nodeType != 3)
//                  .map( (node, index) => {
//                    // =======================================================
//                    // Perfiles
//                    // =======================================================
//                    let container = pol.$('[div-profile]', node)[0];
//                    container.appendChild( 
//                      lineChart({ Width   : 0, 
//                                  Height  : 0,
//                                  Padding : [8, 42, 15, 42]
//                                }).canvas
//                    );
//                    // =======================================================
//                    // Zonas
//                    // =======================================================
//                    try {
//                      fillZoneBars(pol.$('div[zone]', node), activities[index]);
//                    } finally {
//                      return node;
//                    }
//                  });
//      })(),
//      // ========================================================
//      // Configurar los perfiles(canvas) una vez añadidos al DOM
//      // ========================================================
//      (container) => {
//        // ==================================================
//        // Cancelar las subcripciones existentes (RESIZE)
//        // ==================================================
//        resizeSubcriptions.forEach(ctx.unsubscribe);
//        resizeSubcriptions = [];
//        // ==================================================
//        // inicializar los canvas para los perfiles
//        // ==================================================
//        pol.$('div[div-profile] canvas', container)
//           .map( canvas => {
//              let __id = canvas.parentNode.id.split('-')[1];
//              return {
//                canvas, 
//                id       : __id,
//                parent   : canvas.parentNode,
//                dataset  : { 
//                  activity : activities.item('id', __id),
//                  streams  : stravaApi.cache.streams[__id]
//                }
//              };
//           })
//           .forEach(item => {
//              let chart = item.canvas.lineChart;
//              chart.data = createProfileDocument(item.dataset);
//              function __resize() {
//                chart.Resize(item.parent.clientWidth - 9, 
//                             item.parent.clientHeight - 9);
//              }
//              resizeSubcriptions.append(ctx.subscribe(ctx.topics.WINDOW_RESIZE, __resize))
//                                .append(ctx.subscribe('msg\\this_page\\view\\changed', __resize))
//                                .append(ctx.subscribe('msg\\line_chart\\range', (message, e) => {
//                                  if(e.sender.data === chart.data){
//                                    var __from = Math.min(e.start, e.end);
//                                    var __to   = Math.max(e.start, e.end);
//                                    if(__to - __from > 10){
//                                      e.sender.data.configureView(__from, __to);
//                                      __resize();              
//                                    }
//                                  }
//                                }))
//                                .append(ctx.subscribe('msg\\line_chart\\tap', (message, e) => { 
//                                  if(e.sender.data === chart.data){
//                                    e.sender.data.resetView();
//                                    __resize();
//                                  }
//                                }));
//              __resize();        
//              ;
//           });
//      });  


//    });

//  }
               
//  function createProfileDocument(dataset){

//    function __getRange(array, start, end){
//      var __res     = { min : Number.POSITIVE_INFINITY, max : Number.NEGATIVE_INFINITY }; 
//      var __current = start
//      while(__current < end){
//        __res.min = Math.min(__res.min, array[__current]);
//        __res.max = Math.max(__res.max, array[__current]);
//        __current++;
//      }
//      __res.min = .9 * __res.min;
//      __res.range = __res.max - __res.min;
//      return __res;
//    }

//    let document = { 
//      length     : dataset.streams.distance.data.length,
//      distances  : dataset.streams.distance.data,
//      altitude   : dataset.streams.altitude.data,
//      heartrate  : dataset.streams.heartrate.data,
//      watts      : dataset.streams.watts ? dataset.streams.watts.data :
//                                           dataset.streams.velocity_smooth.data.map( s => speedToWatts(s * 3.6) ),
//      offset     : 0.0,
//      view       : {},
//      getRange   : __getRange,
//      configureView : function (start, end){
//        this.view.start   = start;
//        this.view.end     = end; 
//        this.view.x       = {}; 
//        this.view.x.max   = this.distances[end];
//        this.view.x.min   = this.distances[start];
//        this.view.x.range = this.view.x.max - this.view.x.min;
//        this.view.y       = this.getRange(this.altitude, start, end);
//        this.view.h       = this.getRange(this.heartrate, start, end);
//        this.view.w       = this.getRange(this.watts, start, end);
//        // ===============================================================================================
//        // Configurar distintas series de datos
//        // ===============================================================================================
//        this.series = [];
//        if (dataset.activity.trainer == true) {
//          this.series.push({ name        : 'heartrate', 
//                             unit        : 'ppm',
//                             view        : this.view.h,
//                             fillStyle   : 'rgba(150,0,0,.8)', 
//                             lineWidth   : 1,
//                             ratio       : 100.0 / this.view.h.range,
//                             transform   : function(sender, v){
//                               return sender.bounds.top + 
//                                      sender.bounds.height - 
//                                      ((v - sender.data.view.h.min) * this.ratio * sender.bounds.height / 100);
//                             }});
//          this.series.push({ name        : 'watts', 
//                             unit        : 'W',
//                             view        : this.view.w,
//                             lineWidth   : 1, 
//                             strokeStyle : 'rgba(0,0,255,0.8)',
//                             fillStyle   : 'rgba(0,0,200,.5)', 
//                             ratio       : 100.0 / this.view.w.range,
//                             transform   : function(sender, v){
//                               return sender.bounds.top + 
//                                      sender.bounds.height - 
//                                      ((v - sender.data.view.w.min) * this.ratio * sender.bounds.height / 120);
//                             }});
//        } else {
//          this.series.push({ name        : 'altitude',
//                             unit        : 'm',
//                             view        : this.view.y,
//                             fillStyle   : 'rgba(125,125,125,.8)', 
//                             lineWidth   : 1, 
//                             strokeStyle : 'rgba(0,0,0,.8)',
//                             ratio       : 100.0 / this.view.y.range });
//          this.series.push({ name        : 'heartrate', 
//                             unit        : 'ppm',
//                             view        : this.view.h,
//                             fillStyle   : 'rgba(150,0,0,.8)', 
//                             lineWidth   : 1, 
//                             strokeStyle : 'rgba(50,0,0,.9)',
//                             ratio       : 100.0 / this.view.h.range,
//                             transform   : function(sender, v){
//                               return sender.bounds.top + 
//                                      sender.bounds.height - 
//                                      ((v - sender.data.view.h.min) * this.ratio * sender.bounds.height / 120);
//                             }});      
//        }
//        return this;
//      },
//      resetView: function () {
//        return this.configureView(0, this.length - 1);
//      }
//    };

//    return document.resetView();

//  }

//  function fillZoneBars(bars, activity) {
//    if(!activity.has_heartrate) return;
//    let strems = stravaApi.cache.streams[activity.id];
//    let zones  = pol.clone(stravaApi.config.athlete.zones.heart_rate.zones)
//                    .map( z => {
//                      z.count = 0;
//                      return z;
//                    } );
//    strems.heartrate
//          .data
//          .reduce( (z, d) => {
//            if(z[0].max >= d){
//              z[0].count = z[0].count + 1;
//              return z;
//            }
//            if(z[1].max >= d){
//              z[1].count = z[1].count + 1;
//              return z;
//            }
//            if(z[2].max >= d){
//              z[2].count = z[2].count + 1;
//              return z;
//            }
//            if(z[3].max >= d){
//              z[3].count = z[3].count + 1;
//              return z;
//            }
//            z[4].count = z[4].count + 1;
//            return z;
//          }, zones)
//          .map( (z, i) => {
//            let top = z.count/strems.heartrate.data.length * 100;
//            bars[i].style.height = '{0|toFixed,2}%'.format(top < 3 ? 0 : top);
//          });
//  }

//  return component;

//}

