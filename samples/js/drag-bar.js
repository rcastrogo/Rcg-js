
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

    var container;

    function init(){
      var container = core.$('dragbar-container');
      var text      = container.innerHTML;

      var splitter1 = ui.createSplitter();
      var splitter2 = ui.createSplitter();

      splitter1.rightPanel.appendChild(splitter2.element);
      splitter1.leftPanel.innerHTML  = text;
      splitter2.leftPanel.innerHTML  = text;
      splitter2.rightPanel.innerHTML = text;
      splitter2.switchMode();
      core.apply(splitter1.rightPanel.style, { padding : '0' , border : 'none' });

      container.innerHTML = '';
      container.appendChild(splitter1.element);

    }

    module.ajax.get('samples/drag-bar.html').then(function (txt) {
      container = module.core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(module.core.build('div', txt, false));
      init();
    });

  }

  initSample();

}(window[___ROOT_API_NAME]));
