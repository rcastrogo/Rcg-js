
// =====================================================================================
// ui.CollapsibleBox
// =====================================================================================
(function (module) {

  var core   = module.core,
      events = module.events,
      pubsub = module.pubsub,
      ui     = module.ui;

  var template = 
      '<div id="collapsible-box-{0}" class="w3-border" data-collapsible-box>' +
      '  <button class="w3-block w3-border-0" style="outline-style:none">' +
      '     {1}<i style="margin: 2px;" class="fa fa-chevron-down w3-right"></i>' +
      '  </button>' +
      '  <div class="w3-hide w3-border-top" style="overflow:auto"></div>' +
      '</div>';
  var counter = 0;

  var CollapsibleBox = (function () {

      function CollapsibleBox(titulo, content, height) {

        if (titulo === undefined) { titulo = 'título'; }
        if (height === undefined) { height = '10em'; }

        var that = this;
        that.loaded    = false;
        that.collapsed = true;
        that.onexpand  = new events.Event('CollapsibleBox.onexpand');

        that.control = core.build('div', { innerHTML: template.format(++counter, titulo) }, true);
        that.id      = that.control.id;
        that.header  = that.control.querySelector('button');
        that.body    = that.control.querySelector('div');


        that.header.onclick = function () { 
          that.collapsed ? that.expand() : that.collapse(); 
        };
        if (height != '-') this.body.style.height = height;          
        that.setContent(content);          
      }

      CollapsibleBox.create = function (titulo, content, height) {
        return new CollapsibleBox(titulo, content, height);
      };

      CollapsibleBox.prototype.hide = function () {
        this.collapse();
        this.header.classList.add('w3-hide');
        return this;
      };

      CollapsibleBox.prototype.show = function () {
        this.header.classList.remove('w3-hide');
        return this;
      };

      CollapsibleBox.prototype.appendTo = function (parent) {
        parent.appendChild(this.control);
        return this;
      };

      CollapsibleBox.prototype.collapse = function () {
        this.body.classList.add('w3-hide');
        var element = this.header.querySelector('i');
        element.classList.remove('fa-chevron-up');
        element.classList.add('fa-chevron-down');
        this.collapsed = true;
        return this;
      };

      CollapsibleBox.prototype.expand = function () {
        this.body.classList.remove('w3-hide');
        var element = this.header.querySelector('i');
        element.classList.remove('fa-chevron-down');
        element.classList.add('fa-chevron-up');
        this.onexpand.dispatch(this);
        this.collapsed = false;
        return this;
      };

      CollapsibleBox.prototype.getControl = function () { return this.control; };

      CollapsibleBox.prototype.getBody = function () { return this.body; };

      CollapsibleBox.prototype.setContent = function (value) {
        if (value === undefined)
          this.body.innerHTML = '';
        else if (core.isString(value))
          this.body.innerHTML = value;
        else {
          this.body.innerHTML = '';
          this.body.appendChild(value);
        }
        return this;
      };

      return CollapsibleBox;

  }());

  module.ui = module.ui || {};
  module.ui.createCollapsibleBox = CollapsibleBox.create;

}(window[___ROOT_API_NAME]));