
// =====================================================================================
// ui.EditableGrid
// =====================================================================================
(function (module) {

  var pubsub = module.pubsub;

  function EditableGrid(table, onfocus, onchange) {

      var that = this;

      this.currentIndex = -1;
      this.previous = undefined;
      this.table = table;

      var __onfocus = function (e) {
          var div = e.target;
          var td  = div.parentNode;
          var tr  = td.parentNode;
          that.previous = div.textContent.trim();
          that.currentIndex = tr.rowIndex;
          var eventArg = {
              sender  : that,
              tr      : tr,
              td      : td,
              target  : div,
              current : that.previous
          };
          pubsub.publish(EditableGrid.MESSAGE.ON_FOCUS, eventArg);
          if (onfocus) onfocus(that, eventArg);
      };

      var __onblur = function (e) {
          var div = e.target;
          var td  = div.parentNode;
          var tr  = td.parentNode;
          if (that.previous != undefined &&
              that.previous != td.textContent.trim()) {
              var eventArg = {
                  sender  : that,
                  tr        : tr,
                  td        : td,
                  target    : div,
                  previous  : that.previous,
                  current   : div.textContent.trim()
              };
              pubsub.publish(EditableGrid.MESSAGE.ON_CHANGE, eventArg);
              if (onchange) onchange(that, eventArg);
              that.previous = undefined;
          }
          div.style.outline = '1px solid transparent';
      };

      table.querySelectorAll('td div[contenteditable]')
           .toArray()
           .forEach(function (e) {
              e.onblur = __onblur;
              e.onfocus = __onfocus;
           });

      table.onkeypress = function (e) {
        if (e.keyCode == 13) {
            if (e.preventDefault) e.preventDefault();
            return false;
        }
      };

      table.onkeydown = function (e) {
        var res = true;
        var sender = e.target;
        if (sender.tagName == 'DIV' && [13, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            var div = sender;
            var td = div.parentNode;
            var row = td.parentNode;
            var pos = window.getSelection().getRangeAt(0).startOffset;
            var focus = function (t, r, c) {
              e.preventDefault();
              try {t.rows[r].cells[c].firstElementChild.focus();}
              catch (e) { }
              res = false;
            };
            if (e.keyCode == 13)
                focus(table, row.rowIndex, td.cellIndex + 1);
            if (e.keyCode == 38 && row.rowIndex > 1)
                focus(table, row.rowIndex - 1, td.cellIndex);
            if (e.keyCode == 40 && row.rowIndex < table.rows.length - 1)
                focus(table, row.rowIndex + 1, td.cellIndex);
            if (e.keyCode == 39 && pos == sender.textContent.length)
                focus(table, row.rowIndex, td.cellIndex + 1);
            if (e.keyCode == 37 && pos == 0)
                focus(table, row.rowIndex, td.cellIndex - 1);
        }
        return res;
      };
  }

  EditableGrid.MESSAGE = {
    ON_FOCUS  : 'msg//editable-grid//onfocus',
    ON_CHANGE : 'msg//editable-grid//onchange'
  }

  module.ui = module.ui || {};
  module.ui.EditableGrid = EditableGrid;

})(window[___ROOT_API_NAME]);