
(function(module){

  var core = module.core,
        ui = module.ui;

  var template = '<div class="drag-container">' + 
                 '  <div class="drag-left"></div>' + 
                 '  <div class="drag-bar"></div>' + 
                 '  <div class="drag-right"></div>' +
                 '</div>'

  function Splitter(){

    this.element    = core.build('div', template, true);
    this.leftPanel  = core.element('.drag-left', this.element);
    this.rightPanel = core.element('.drag-right', this.element);

    var mode = 'horizontal',
        bar  = core.element(".drag-bar", this.element),
        that = this,
        pos  = { 
          x : 0, 
          y : 0
        },
        size = { 
          width  : this.leftPanel.clientWidth, 
          height : this.leftPanel.clientHeight
        };

    this.switchMode = function(){
      if(mode == 'horizontal'){
        that.element.style.flexDirection = 'column';  
        that.leftPanel.style.width = '100%';
        that.rightPanel.style.width = '100%';
        that.leftPanel.style.height = '40%';
        bar.style.cursor = 'row-resize';
        mode = 'vertical';
      } else {
        that.element.style.flexDirection = '';  
        that.leftPanel.style.width = '40%';
        that.rightPanel.style.width = '';
        that.leftPanel.style.height = '';
        bar.style.cursor = 'col-resize';
        mode = 'horizontal';
      }
    }

    function drag(e) {
      document.selection ? document.selection.empty() : window.getSelection().removeAllRanges();
      if(mode == 'vertical')
        that.leftPanel.style.height = '{0}px'.format(size.height + (e.pageY - pos.y));
      else
        that.leftPanel.style.width = '{0}px'.format(size.width + (e.pageX - pos.x));
    };

    bar.addEventListener("dblclick", function(e){ that.switchMode(); });
    bar.addEventListener("mouseup", function(){ document.removeEventListener("mousemove", drag); });
    bar.addEventListener("mousedown", function(e){
      size.width  = that.leftPanel.offsetWidth;
      size.height = that.leftPanel.offsetHeight;
      pos.x = e.pageX;
      pos.y = e.pageY;
      document.addEventListener("mousemove", drag); 
    });
    document.addEventListener("mouseup", function(){ 
      document.removeEventListener("mousemove", drag); 
      document.removeEventListener("mouseup", this);
    });
  }

  function createSplitter(){ return new Splitter(); }

  ui.createSplitter = createSplitter;

}(window[___ROOT_API_NAME]));

(function(module){
  
  var core = module.core,
      ui   = module.ui;

  function initSample(){

    var config = core.config('code-viewer');
    var container;
    var splitter1;
    var fontButtons

    function loadFile(url){
      var layer = ui.dialogBuilder.showLayer(true);
      module.ajax.get(url).then(function (txt) {
        var ext = url.split('.').lastItem();
        var viewer  = ui.createTextViewer(txt);
        var element = viewer.getControl();
        var main    = core.element('.scv_Main', element);
        if(ext != 'txt') main.classList.add('w3-code');          
        core.wrap(main)
            .css('border', 'none')
            .css('fontSize', config.read('font-size', '13px'))
            .css('margin', '0', 'important');  
        if(ext != 'txt')
          core.element('.scv_TextContainer', element).classList.add(ext + 'High'); 

        splitter1.rightPanel.innerHTML = '';
        splitter1.rightPanel.appendChild(element);
        splitter1.rightPanel.appendChild(fontButtons[0]); // up
        splitter1.rightPanel.appendChild(fontButtons[1]); // down
        w3CodeColor(element);
        layer.close(true);
      });

    }

    function init(){
      
      splitter1 = ui.createSplitter();   
      splitter1.leftPanel.appendChild(core.element('.w3-ul'));
      core.$('dragbar-container')
          .appendChild(splitter1.element);
      
      var current;
      var items = core.elements('li[on-click]', splitter1.leftPanel)
                      .map(function(li,i){ 
                        if(!current) current = li;
                        li.classList.add('w3-hover-pale-blue'); 
                        return li;
                      });

      // =============================================================================
      // Eventos de la vista de código
      // =============================================================================
      fontButtons = core.$('#font-buttons button');
      ui.addEventListeners(
        fontButtons[0].parentNode,
        {
          changeFont : function(button, mouseEvent, arg){
            var target = core.element('.scv_Main', button.parentNode);
            var container = core.element('.scv_TextContainer', target)
            var size = ~~target.style.fontSize.replace('px', ''); 
            target.style.fontSize = '{0}px'.format(size + (arg == 'up' ? 1 : -1 ));
            config.write('font-size', target.style.fontSize);
          }
        }
      );
      // =========================================================
      // Eventos de la lista de ficheros
      // =========================================================
      ui.addEventListeners(
        splitter1.leftPanel,
        {
          showfile : function(li, mouseEvent, path){
            if(current) current.classList.remove('w3-pale-blue');
            current = li;
            li.classList.add('w3-pale-blue');
            loadFile('{0}{1}'.format(path, li.textContent))
          }
        }
      );

      current.click();

    }

    module.ajax.get('samples/code.html').then(function (txt) {
      container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));

      core.include('js/text-viewer.js', 'js-text-viewer', false)
          .then(function(){ 
            core.include('js/w3codecolor.js')
                .then(function(){
                  init(); 
                });                      
          });
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
