 /*
 * File: harrixListWithFilter.js
 * Desc: list with filter.
 * Requires: jQuery.
 * License: MIT.
 */
(function( $ ){

  $.fn.harrixListWithFilter = function(ul, input) {
    $(input)
    .change(function() {
      doFilter($(ul), $(input).val().toLowerCase());
    })
    .keyup(function() {
      $(input).change();
    })
    .on('paste', function () {
      setTimeout(function () {
        $(input).change();
      }, 100);
    });
    return this;
  };
  
  function doFilter(obj, filter) {
    var showObj = false;
    $.each( obj.children(), function( i, val ) {
      var li = $(val);
      if (li.is('li')) {
        var show = checkChildren(li.children(), filter);
        if (show == false)
          show = findString(li.text().toLowerCase(), filter);
        if (show == true)
          li.show();
        else
          li.hide();
        if (show == true)
          showObj = true;
      }
    });    
    return showObj;
  };
  
  function checkChildren(children, filter) {
    var show = false;
    if (children.length > 0) {
      $.each( children, function( i, val ) {
        if (doFilter($(val), filter) == true)
          show = true;
      });
    }
    return show;      
  };
  
  function findString(text, textFind) {
    var find = false;
    if (text.indexOf(textFind) >= 0)
      find = true;
    return find;      
  };

})( jQuery );