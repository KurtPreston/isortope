// Convert cells for comparison
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
      returnVal = parseFloat(lstrip);
    } else if (!isNaN(parseFloat(rstrip))) {
      returnVal = parseFloat(rstrip);
    } else {
      returnVal = text;
    }
  } else if (input.length > 0) {
    // No text -- assuming form input
    if (input.val() == 'on') {
      // Check box
      returnVal = input.is(':checked').toString();
    } else {
      returnVal = input.val();
    }
  } else {
    returnVal = text;
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
        table.find('th:nth-child(' + (col + 1) + ')').css('width', colWidth);
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
      table.find('th').css('cursor', 'pointer');

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

      });

      // Update sort data if fields change
      table.find('input').change(function() {
        var parentRow = $(this).closest('tr');
        table.find('tbody').isotope('updateSortData', parentRow);
      });
    });
  };
})(jQuery);

$(document).ready(function() {
  $('table.isortope').isortope();
});
