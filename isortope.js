$(document).ready(function() {
  $.each($('table.isortope'), function(index, table) {
    table = $(table);

    // Fix position
    table.css('position', 'relative');

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
      var sortFunctionDef = "return item.find('." + colClass + "').text();";
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

      $('.sort-arrow').css('float', 'right');

      table.find('tbody').isotope({
        sortBy: sort,
        sortAscending: !reverse
      });
    });
  });
});
