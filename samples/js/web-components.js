
(function(module){
  
  var core      = module.core;
  var ajax      = module.ajax;
  var ui        = module.ui;

  class RcgHtmlContainer extends HTMLElement {

    static observedAttributes = ["src"];

    constructor() {
      super();
      this.style.border  = 'solid 1px silver';
      this.style.display = 'block';
      this.style.padding = '5px';
    }

    connectedCallback() {
      this.loadResource();
    }

    get src() {
      return this.getAttribute('src');
    }

    set src(value) {   
      if (value) {
        this.setAttribute('src', value);
      } else {
        this.removeAttribute('src');
      }
    }

    disconnectedCallback() {  }
    adoptedCallback() { }

    attributeChangedCallback(name, oldValue, newValue) {
      if(name === 'src') this.loadResource();
    }

    loadResource(){
      var src = this.getAttribute('src');
      this.innerHTML = '';
      if(src)
        ajax.get(src)
            .then(html => this.innerHTML = html);
    }
  }

  class RcgCollapsibleBox extends HTMLElement {

    constructor() {
      super();
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = '<link rel="stylesheet" href="css/w3.css">' +
                             '<link rel=stylesheet href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">';
      var h1 = rcg.core.element('h1', this);
      const title = h1 ? h1.textContent : 'CollapsibleBox';
      this.control = ui.createCollapsibleBox(title, '<slot></slot>', '100px')
                       .appendTo(shadowRoot);
      if(h1) h1.remove();
    }

  }

  class RcgCollapsibleBoxGroup extends HTMLElement {

    #current;

    constructor() {
      super();
    }

    connectedCallback() { 
      var fn = this.#onexpand.bind(this);
      core.elements('rcg-collapsible-box', this)
          .forEach( c => c.control.onexpand.add(fn) );
    }

    #onexpand(sender, value){
      if(this.#current && this.#current.collapsed == false) this.#current.collapse();
      this.#current = sender;

    }

    appendChild(child){
      super.appendChild(child);
      if(child instanceof RcgCollapsibleBox){

        child.control.onexpand.add(this.#onexpand.bind(this))
      }
    }

  }

  if(!customElements.get('rcg-html'))                  customElements.define('rcg-html', RcgHtmlContainer);
  if(!customElements.get('rcg-collapsible-box'))       customElements.define('rcg-collapsible-box', RcgCollapsibleBox);
  if(!customElements.get('rcg-collapsible-box-group')) customElements.define('rcg-collapsible-box-group', RcgCollapsibleBoxGroup);


}(window[___ROOT_API_NAME]));

(function(module){
  
  var core      = module.core;
  var ajax      = module.ajax;
  var ui        = module.ui;

  function test(){
    var form = core.element('form');
    var data = ajax.formToJSON(form);
    console.log(data);

    var query = ajax.formToQuery(form)
    console.log(query);
  }

  function initSample(){

    function initPanels(){
      ui.monthsNames
        .forEach(function(month){
          ui.createCollapsibleBox(month, month, '100px')
            .appendTo(core.element('collapsible-panel-container'));
        });

      core.element('rcg-collapsible-box-group')
          .appendChild( core.build('div', '<rcg-collapsible-box><h1>appendChild</h1><div>Contenido appendChild.</div></rcg-collapsible-box>', true)); 
    }

    function init(){
      
      core.include('js/calendar.js', 'calendar')
          .then(initPanels);
    }

    module.ajax.get('samples/web-components.html').then(function (txt) {
      var container = core.$('main-container');      
      container.innerHTML = '';
      container.appendChild(core.build('div', txt, false));

      core.include('js/list.js', 'js-list', false)
          .then(init);




    });

  }

  initSample();

}(window[___ROOT_API_NAME]));

