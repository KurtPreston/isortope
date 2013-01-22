// Convert cells for comparison
var isortopeNumToString = function(number) {
  number = parseFloat(number)
  var length = 40; // Create a string of length 40
  var str = '' + number;
  var numDigits = Math.floor(Math.log(number) / Math.LN10);

  for(var i = numDigits; i < length; i++) {
    str = '0' + str;
  }

  return str;
}

var isortopeCellFilter = function(element) {
  var text = $(element).text();
  var input = $(element).find('input');
  var returnVal;

  var parseString = function(text) {
    var numText = text.replace(',', '');
    var lstrip = numText.substr(1, numText.length);
    var rstrip = numText.substr(1, numText.length);

    if (!isNaN(parseFloat(numText))) {
      // Text is a flaot or integer
      return isortopeNumToString(numText);
    } else if (!isNaN(parseFloat(lstrip))) {
      // is num without left-most character (i.e. $4.50)
      return isortopeNumToString(lstrip);
    } else if (!isNaN(parseFloat(rstrip))) {
      // is num without right-most character (i.e. 60%)
      return isortopeNumToString(rstrip);
    } else {
      // Plain text
      return text.toLowerCase();
    }
  }

  if (text != '') {
    // Cell has text
    returnVal = parseString(text);
  } else if (input.length > 0) {
    // If there are inputs
    if (input.val() == 'on') {
      // Check box
      returnVal = input.is(':checked').toString();
    } else {
      returnVal = parseString(input.val());
    }
  } else {
    // No text or inputs... sort by raw HTML
    returnVal = $(element).html();
  }

  return returnVal;
};

// jQuery plugin to monitor changes.  Adapted from the following code:
// http://stackoverflow.com/questions/3233991/jquery-watch-div/3234646#3234646
jQuery.fn.contentChange = function(callback){
  var elms = jQuery(this);
  elms.each(
    function(i){
      var elm = jQuery(this);
      elm.data("lastContents", elm.html());
      window.watchContentChange = window.watchContentChange ? window.watchContentChange : [];
      window.watchContentChange.push({"element": elm, "callback": callback});
    }
  )
  return elms;
}
setInterval(function(){
  if(window.watchContentChange){
    for( i in window.watchContentChange){
      if(window.watchContentChange[i].element.data("lastContents") != window.watchContentChange[i].element.html()){
        window.watchContentChange[i].callback.apply(window.watchContentChange[i].element);
        window.watchContentChange[i].element.data("lastContents", window.watchContentChange[i].element.html())
      };
    }
  }
},500);

(function($) {
  $.fn.isortope = function() {

    return this.each(function() {

      var table = $(this);

      // Fix position
      table.css('position', 'relative');
      table.css('height', table.height());

      // Fix column width
      var numCols = table.find('th').length
      for(var col = 0; col < numCols; col++) {
        var colWidth = table.find('tr:first-child td:nth-child(' + (col + 1) + ')').width();
        table.find('tr td:nth-child(' + (col + 1) + ')').css('width', colWidth);

        // Set th width
        var th = table.find('th:nth-child(' + (col + 1) + ')');
        var thWidth = th.width();
        th.css('width', thWidth);
        th.css('max-width', thWidth);
      }

      // Define sorters
      var sorters = {};
      for(var col = 0; col < numCols; col++) {
        var colClass = 'col' + col;
        var sortFunctionDef = "return isortopeCellFilter(item.find('." + colClass + "'));";
        var sortFunction = new Function('item', sortFunctionDef);
        sorters[colClass] = sortFunction;
        table.find('tr td:nth-child(' + (col + 1) + ')').addClass(colClass);
        table.find('th:nth-child(' + (col + 1) + ')').attr('data-sort-type', colClass);
      }

      // Initialize isotope
      table.find('tbody').isotope({
        itemSelector: 'tr',
        layout: 'fitRows',
        getSortData: sorters
      });

      // Style
      var headerHeight = table.find('thead').height();
      table.find('tr').css('top', headerHeight);
      var th = table.find('th');
      th.css('cursor', 'pointer');
      th.height(th.height());
      th.css('line-height', 1);

      var removeSortArrow = function() {
        var activeHeader = table.find('th.sortAsc,th.sortDesc');
        activeHeader.find('.sort-arrow').remove();
        activeHeader.removeClass('sortAsc').removeClass('sortDesc');
      }

      // Header click handlers
      table.find('th').click(function() {
        var sort = $(this).attr('data-sort-type');
        var reverse;

        if ($(this).hasClass('sortAsc')) {
          // Switch to sortDesc
          reverse = true;
          removeSortArrow();
          $(this).html($(this).html() + '<span class="sort-arrow">\u25BC</span>');
          $(this).addClass('sortDesc');
        } else {
          // Switch to sortAsc
          reverse = false;
          removeSortArrow();
          $(this).html($(this).html() + '<span class="sort-arrow">\u25B2</span>');
          $(this).addClass('sortAsc');
        }

        table.find('tbody').isotope({
          sortBy: sort,
          sortAscending: !reverse,
        });

        table.trigger('sort');
      });

      // Update sort data if fields change
      table.find('input').change(function() {
        var parentRow = $(this).closest('tr');
        table.find('tbody').isotope('updateSortData', parentRow);
      });

      // Update sort data if cell text changes
      table.find('td').contentChange( function() {
        var parentRow = $(this).closest('tr');
        table.find('tbody').isotope('updateSortData', parentRow);
      });

      table.trigger('initialized');
    });
  };
})(jQuery);

$(document).ready(function() {
  $('table.isortope').isortope();
});
