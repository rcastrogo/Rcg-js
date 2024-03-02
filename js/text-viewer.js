
(function(module){

  var core   = module.core
      ui     = module.ui
      events = module.events;

  var css_code = '.svc_viewer{overflow:hidden;}\n' +
                 '.scv_Main  {position:absolute;top:0;left:0;right:0;bottom:0;overflow:auto;padding:0;}\n' +     
                 '.scv_TextContainer{ position:absolute;top:0;left:4.4em;right:0;height:auto;z-index:4;margin:0;user-select: text; }\n' +
                 '.scv_TextContainer{ padding:.4em;white-space:pre;overflow:initial;font-family:Monospace;tab-size:4;}\n' +
                 '.scv_LineContainer{ padding:.4em;position:absolute;top:0;left:0;height:auto;margin:0;z-index:5;overflow:hidden;background-color:lightyellow;border-right:solid 1px silver;}\n' +
                 '.scv_LineContainer{ font-weight:bold;font-family:Monospace;color:Gray;text-align:right;width:3.5em;box-sizing:border-box;user-select:none }';
  var data_Uri = 'data:text/css;base64,' + window.btoa(css_code),
      counter  = 0,
      template = '<div class="scv_Main">' +
                 '  <pre class="scv_LineContainer" id="svc_{0}_line"></pre>' +
                 '  <pre class="scv_TextContainer" id="svc_{0}_code"></pre>' +
                 '</div>';

  var css = false;
  function initCss() {
    if (css) return;
    document.querySelector('head')
            .appendChild(core.build('link', { rel: 'stylesheet',
                                              type: 'text/css',
                                              href: data_Uri }));
    css = true;
  }

  var TextViewer = (function () {

    function TextViewer(text) {
      var _this = this;
      this.id = 'svc_{0}'.format(++counter);
      this.onclick = new events.Event('txt-viewer.onclick');
      initCss();
      this.control = core.build('div', { className : 'svc_viewer',
                                         id        : this.id,
                                         innerHTML : template.format(counter) });
      this.control
          .querySelector('.scv_TextContainer')
          .onclick = function (e) { return  _this.onclick.dispatch(e); };

      this.control
          .querySelector('.scv_Main')
          .onscroll = _this.control
                           .querySelector('.scv_LineContainer')
                           .style.left = '{0}px'.format(event.target.scrollLeft);

      if(text) this.setContent(text);

    }

    TextViewer.prototype.setContent = function (value) {
        this.control
            .querySelector('.scv_LineContainer')
            .innerHTML = value.replace(/(\r\n|\r|\n)/mg, '\n')
                              .split('\n')
                              .reduce(function (a, _, i) { return a += (i + 1) + '<br/>'; }, '');
        this.control.querySelector('.scv_TextContainer').textContent = value;
        return this;
    };

    TextViewer.prototype.getControl = function () { return this.control; };

    TextViewer.create = function (text) { return new TextViewer(text); };

    return TextViewer;

  }());

  module.ui.createTextViewer = TextViewer.create;

})(window[___ROOT_API_NAME]);



