 /*
 * File: harrixListWithFilter.js
 * Desc: list with filter.
 * Requires: jQuery.
 * License: MIT.
 */
(function( $ ){

  $.fn.harrixListWithFilter = function(list, options) {
    
    var plugin = this;
    
    var list = $(list);
    var ul = list.find('.ul-root:first');
    var input = list.find('.input-filter:first');
    var divOnlyLi = list.find('.only-li:first');
    
    var defaults = {
      changeCursor : true,
      collapsedStart : 'none',
      countItems : 'none',
      countItemsInFilter: 'none',
      functionSearch : findString,
      listStyle : 'default',
      paddingLi : 'default',
      rememberStateBeforeFiltering: true,
      searchBy : 'content',
      showCollapsedExpndedAll: false,
      showFilterResults : 'default',
      showZeroCountItems : true,
	  };
    
    plugin.settings = $.extend({}, defaults, options);
    
    ul.click(toggleUl);
    
    setOptionCollapsedStart();
    
    if (plugin.settings.showCollapsedExpndedAll) {
      list.find(".buttons").show();
    }
    
    if (plugin.settings.listStyle == 'default') {
      ul.find("li").css('list-style', 'inherit');
    }
    if (plugin.settings.listStyle == 'none') {
      ul.find("li").css('list-style', 'none');
      ul.css('padding-left', '0px');
    }
    if (plugin.settings.listStyle == 'arrows') {
      ul.find("li").css('list-style', 'none');
      ul.css('padding-left', '0px');
    }

    listTraversal (ul.children(), workWithElement);
    listTraversal (ul.children(), showCountItems);
    listTraversal (ul.children(), distributeCollapsedExpanded);
    
    list.find('.button-expand:first')
    .click(function() {
      ul.find("ul").show().attr('data-collapse', 'false').attr('data-collapse-history', 'false');
      listTraversal (ul.children(), distributeCollapsedExpanded);
    });
    
    list.find('.button-collapse:first')
    .click(function() {
      ul.find("ul").hide().attr('data-collapse', 'true').attr('data-collapse-history', 'true');
      listTraversal (ul.children(), distributeCollapsedExpanded);
    });
    
    list.find('.search-clear:first')
    .click(function() {
      input.val("");
      input.change();
      input.focus();
    });
    
    input
    .change(function() {
      var filter = input.val().toLowerCase();
      
      ul.find("li").removeAttr('data-find');
      
      if (filter.trim()) {
        list.find('.search-clear:first').css('display','block');
        
        if (plugin.settings.showCollapsedExpndedAll)
          list.find(".buttons").hide();
        
        if (plugin.settings.showFilterResults != 'only-leafs') {
          divOnlyLi.hide();
          
          doFilter(ul, filter);
          ul.find("ul").show();

          ul.show();
          
          ul.find("li:visible").each(function (index, element) {
            var element = $(element);
            if (element.find("li:visible").length > 0) {
              if ((element.hasClass('collapsed'))||(element.hasClass('expanded'))) {
                element.removeClass('collapsed');
                element.addClass('expanded');
              }
            }
            else {
              if ((element.hasClass('collapsed'))||(element.hasClass('expanded'))) {
                element.removeClass('expanded');
                element.addClass('collapsed');
              }
            }
          });
          
          ul.find("li:visible").each(function (index, element) {
            var element = $(element);
            var filter = input.val().toLowerCase();
            var text = getTextFromLiInNestedList(element).toLowerCase();
            var find = plugin.settings.functionSearch( text, filter );
            if (find)
              element.attr('data-find','true');
          });
          
          if (ul.find("li:visible").length == 0) {
            ul.hide();
            list.find(".no-results:first").show();
          }
          else {
            ul.show();
            list.find(".no-results:first").hide();
          }
          
          if (plugin.settings.showFilterResults == 'with-sublists') {
            ul.find("[data-find='true']").each(function (index, element) {
              var element = $(element);
              element.find('ul').each(function (index, subUl) {
                var subUl = $(subUl);
                if (subUl.find("[data-find='true']").length == 0) {
                  subUl.hide().attr('data-collapse', 'true');
                }
                else {
                  subUl.show().attr('data-collapse', 'false');
                }
              });
              element.show();
              element.find('li').show();
            });
            ul.find("ul").each(function (index, element) {
              var element = $(element);
              if (element.find('li:visible').length > 0)
                element.show().attr('data-collapse', 'false');
             });
            listTraversal (ul.children(), distributeCollapsedExpanded);
          }
          
          if (plugin.settings.countItemsInFilter == 'none') {
            ul.find('.count-li').hide();
          }
          if (plugin.settings.countItemsInFilter == 'not-changed') {          
          }
          if (plugin.settings.countItemsInFilter == 'changed') {
            if (plugin.settings.showFilterResults == 'with-sublists')
              updateCountItemsshowFilterResults();
            else
              listTraversal (ul.children(), updateCountItems);
          }
          
          if (!plugin.settings.rememberStateBeforeFiltering) {
            ul.find("ul").each(function (index, element) {
              var element = $(element);
              element.attr('data-collapse-history', element.attr('data-collapse'));
            });
          }
        }
        else {
          ul.hide();
          divOnlyLi.empty();
          divOnlyLi.show();

          ul.find("li").each(function (index, element) {
            var element = $(element);
            if (isLiTreeLeaf(element)) {
              var filter = input.val().toLowerCase();
              var text = getTextFromLiInNestedList(element).toLowerCase();
              var find = plugin.settings.functionSearch( text, filter );
              if (find) {
                element.attr('data-find','true');
                divOnlyLi.append(element.clone());
              }
            }
          });
          
          if (divOnlyLi.find("li:visible").length == 0) {
            divOnlyLi.hide();
            list.find(".no-results:first").show();
          }
          else {
            divOnlyLi.show();
            list.find(".no-results:first").hide();
          }
        }
      }
      else {
        listTraversal (ul.children(), returnStateCollapse);
        listTraversal (ul.children(), distributeCollapsedExpanded);
        ul.find('.count-li').show().each(function (index, element) {
            var element = $(element);
            var count = element.attr('data-count');
            element.text(count);
          });
        list.find(".no-results:first").hide();
        ul.show();
        if (plugin.settings.showFilterResults == 'only-leafs') {
          divOnlyLi.empty();
          divOnlyLi.hide();
        }
        list.find('.search-clear:first').css('display','none');
        if (plugin.settings.showCollapsedExpndedAll)
          list.find(".buttons").show();
      }
    })
    .on('keyup paste', function () {
      setTimeout(function () {
        input.change();
      }, 100);
    });
    
    function setOptionCollapsedStart() {
      if (plugin.settings.collapsedStart == 'all') {
        ul.find("ul").hide().attr('data-collapse', 'true').attr('data-collapse-history', 'true');
      }
      if (plugin.settings.collapsedStart == 'none') {
        ul.find("ul").show().attr('data-collapse', 'false').attr('data-collapse-history', 'false');
      }
      if (plugin.settings.collapsedStart == 'close-last-ul') {
        ul.find("ul").each(function (index, element) {
          var element = $(element);
          if (element.find('ul').length == 0 )
            element.hide().attr('data-collapse', 'true').attr('data-collapse-history', 'true');
          else
            element.show().attr('data-collapse', 'false').attr('data-collapse-history', 'false');
        });
      }
      if (plugin.settings.collapsedStart == 'first-open') {
        ul.find("ul").hide().attr('data-collapse', 'true').attr('data-collapse-history', 'true');
        $.each( ul.children(), function( i, element ) {
          var element = $(element);
          if (element.is('li')) {
            $.each( element.children(), function( i, element ) {
              var element = $(element);
              if (element.is('ul'))
                element.show().attr('data-collapse', 'false').attr('data-collapse-history', 'false');
            });
          }
        });
      }     
    };
    
    function returnStateCollapse (element) {
      var element = $(element);
      if (element.is('ul')) {
        if (element.attr('data-collapse-history') == 'true') {
          element.hide();
          element.attr('data-collapse','true');
        } else {
          element.show();
          element.attr('data-collapse','false');
        }
      }
      else if (element.is('li')) {
        element.show();
      }
    };
  
    function toggleUl(event) {
      var filter = input.val().toLowerCase();
      var target = $(event.target);
      if (target.is("li")) {
        $.each( target.children(), function( i, element ) {
          var element = $(element);
          if (element.is('ul')) {
            element.toggle();
            toggleAttr (element, 'data-collapse', 'true', 'false');
            if ((!filter.trim())||(!plugin.settings.rememberStateBeforeFiltering))
              element.attr('data-collapse-history', element.attr('data-collapse'));
            toggleCollapsEdexpanded (target, element);
          }
        });
      }
      else {
        if (!target.is("ul")) {
          var li = target.closest("li");
          var ulFirst = li.find('ul:first');
          ulFirst.toggle();
          toggleAttr (ulFirst, 'data-collapse', 'true', 'false');
          if ((!filter.trim())||(!plugin.settings.rememberStateBeforeFiltering))
            element.attr('data-collapse-history', element.attr('data-collapse'));
          toggleCollapsEdexpanded (li, ulFirst);
        }
      }
    };
    
    function toggleCollapsEdexpanded (li, ulList) {
      if (plugin.settings.listStyle == 'arrows')
        if ((li.hasClass( "collapsed" ))||(li.hasClass( "expanded" )))
          if (ulList.attr('data-collapse') == 'true') {
              li.addClass('collapsed');
              li.removeClass('expanded');
            }
            else {
              li.addClass('expanded');
              li.removeClass('collapsed');
            }      
    };
    
    function toggleAttr (element, name, first, second) {
      if (element.attr(name) == first) {
        element.attr(name, second);
      } else {
        element.attr(name, first);
      }
    };
    
    function listTraversal (listT, processingElement) {
      if (listT.length > 0) {
        $.each( listT, function( i, element ) {
          var element = $(element);        
          processingElement (element);        
          listTraversal(element.children(), processingElement);
        });
      }
    };

    function workWithElement (element) {
      if (plugin.settings.changeCursor) {
        if (isLiTreeLeaf(element))
          element.css('cursor', 'pointer');
        else {
          if ((!element.is("li"))&&(!element.is("ul"))) {
            if (isLiTreeLeaf(element.closest("li")))
              element.css('cursor', 'pointer');
            else
              element.css('cursor', 'default');
          }
        else
          element.css('cursor', 'default');          
        }
      }
      
      if (plugin.settings.paddingLi === 'left-leafs') {
        if (element.is("li"))
          if (isLiTreeLeaf(element))
            element.addClass('padding-left');
      }
      if (plugin.settings.paddingLi === 'none')
        element.css('padding-left','0px');
    };

    var liWorkWithElement;    
    function showCountItems (element) {
      if (element.is("li"))
        liWorkWithElement = element;
      
      if (element.is("ul")) {
        if (plugin.settings.countItems == 'all-li') {
          var count = element.find('li').length;
          if ((plugin.settings.showZeroCountItems) || 
             ((!plugin.settings.showZeroCountItems) && (count > 0)))
            liWorkWithElement.prepend( '<span class="count-li" data-count="'+count+'">'+count+'</span>' );
        }
        if (plugin.settings.countItems == 'only-leafs') {
          var count = 0;
          element.find('li').each(function (index, element) {
            var element = $(element);
            if (element.find('ul').length == 0)
              count++;
          });
          if ((plugin.settings.showZeroCountItems) || 
             ((!plugin.settings.showZeroCountItems) && (count > 0)))
            liWorkWithElement.prepend( '<span class="count-li" data-count="'+count+'">'+count+'</span>' );
        }
      }
    };
    
    function updateCountItems (element) {
      if (element.is("li"))
        liWorkWithElement = element;
      
      if (element.is("ul:visible")) {
        if (plugin.settings.countItems == 'all-li') {
          var count = element.find('li:visible').length;
          if ((plugin.settings.showZeroCountItems) || 
             ((!plugin.settings.showZeroCountItems) && (count > 0)))
            liWorkWithElement.find('.count-li').text(count);
        }
        if (plugin.settings.countItems == 'only-leafs') {
          var count = 0;
          element.find('li:visible').each(function (index, element) {
            var element = $(element);
            if (element.find('ul:visible').length == 0)
              count++;
          });
          if ((plugin.settings.showZeroCountItems) || 
             ((!plugin.settings.showZeroCountItems) && (count > 0)))
            liWorkWithElement.find('.count-li').text(count);
        }
      }
    };
    
    function updateCountItemsshowFilterResults() {
      ul.find("[data-find='true']").each(function (index, elementFind) {
        var elementFind = $(elementFind);
        elementFind.find('.count-li').each(function (index, element) {
          var element = $(element);
          var count = element.attr('data-count');
          element.text(count);
        });
        elementFind.text(elementFind.attr('data-count'));
      });
      ul.find("li").each(function (index, elementFind) {
        var elementFind = $(elementFind);
        if (elementFind.closest("[data-find='true']").length == 0) {
          if ((!isLiTreeLeaf(elementFind))) {
            var count = 0;
            elementFind.find('li').each(function (index, element) {
              if ($(element).css('display')!='none') {
                if (plugin.settings.countItems == 'only-leafs')
                  if (isLiTreeLeaf($(element)))
                    count++;
                if (plugin.settings.countItems == 'all-li')
                  count++;
              }
            });
            elementFind.find('.count-li:first').text(count);
          }
        }
      });
    };
    
    function distributeCollapsedExpanded (element) {
      if (element.is('li')) {
        if (!isLiTreeLeaf(element)) {
          var ulForLi = element.find('ul:first');
          if (ulForLi.attr('data-collapse') == 'true') {
            element.addClass( "collapsed" );
            element.removeClass( "expanded" );
          }
          else {
            element.addClass( "expanded" );
            element.removeClass( "collapsed" );
          }
        }
      }
    };
  
    function doFilter(obj, filter) {
      var showObj = false;
      $.each( obj.children(), function( i, element ) {
        var li = $(element);
        if (li.is('li')) {
          var show = checkChildren( li.children(), filter );
          if (!show) {
            var text = getTextFromLiInNestedList(li).toLowerCase();
            show = plugin.settings.functionSearch( text, filter );
          }
          if (show) {
            showObj = true;
            li.show();
          }
          else
            li.hide();
        }
      });
      if (obj.is('li'))
        if (showObj)
          obj.show();
        else
          obj.hide();
      return showObj;
    };
    
    function checkChildren(children, filter) {
      var show = false;
      if (children.length > 0) {
        $.each( children, function( i, element ) {
          if (doFilter($(element), filter))
            show = true;
        });
      }
      return show;      
    };
    
    function getTextFromLiInNestedList (element) {
      var text;
      if (plugin.settings.searchBy == 'content') {
        text = getTextToNewLine (element);
      }
      if (plugin.settings.searchBy == 'value') {
        text = element.data('value');
        if (text === undefined) {
          text = getTextToNewLine (element);
        }
        else if (!text.trim()) {
          text = getTextToNewLine (element);
        }
      }
      return text;
    };
    
    function getTextToNewLine (element) {
      var text = element.text();
      
      if (text.indexOf('\n') >= 0)
        text = text.substring(0, text.indexOf('\n'));

      var attr = element.find('.count-li:first').text();
      if (!(attr === undefined))
        text = text.substring(text.indexOf(attr)+attr.length, text.length);

      return text;
    };
    
    function isLiTreeLeaf(element) {
      if (element.is('li')) {
        if (element.children().find('li').length > 0)
          return false;
        else
          return true;
      }
      return false;
    };
    
    function findString(text, textFind) {
      var find = false;
      if (text.indexOf(textFind) >= 0)
        find = true;
      return find;      
    };
  
    return this;
  };

})( jQuery );