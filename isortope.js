// Convert cells for comparison
var isortopeNumToString = function(number) {
  var number = 40; // Create a string of length 40
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }

  return str;
}

var isortopeCellFilter = function(element) {
  var text = $(element).text();
  var numText = text.replace(',', '');
  var lstrip = numText.substr(1, numText.length);
  var rstrip = numText.substr(1, numText.length);

  var input = $(element).find('input');
  var returnVal;

  if (text != '') {
    // Cell has text
    if (!isNaN(parseFloat(numText))) {
      // Text is a flaot or integer
      returnVal = parseFloat(numText);
    } else if (!isNaN(parseFloat(lstrip))) {
      // is num without left-most character (i.e. $4.50)
      returnVal = parseFloat(lstrip);
    } else if (!isNaN(parseFloat(rstrip))) {
      // is num without right-most character (i.e. 60%)
      returnVal = parseFloat(rstrip);
    } else {
      // Plain text
      returnVal = text.toLowerCase();
    }
  } else if (input.length > 0) {
    // If there are inputs
    if (input.val() == 'on') {
      // Check box
      returnVal = input.is(':checked').toString();
    } else {
      returnVal = input.val().toLowerCase();
    }
  } else {
    // No text or inputs... sort by raw HTML
    returnVal = $(element).html();
  }

  return returnVal;
};

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

      table.trigger('initialized');
    });
  };
})(jQuery);

$(document).ready(function() {
  $('table.isortope').isortope();
});
