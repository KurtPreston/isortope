/*
* isortope v1.3.0
* Simple, animated JavaScript table sorting
*
* https://github.com/KurtPreston/isortope
*/


(function($, doc, win) {
  "use strict";

  function Isortope(el, opts) {
    //---------- Initialization ---------------
    this.$el = $(el);

    this.defaults = {
      autoResort: true,
      autoResortInput: true,
      autoResortContent: true
    };

    this.opts = $.extend(this.defaults, opts, {
      autoResort: this.$el.data('isortope-autoresort'),
      autoResortInput: this.$el.data('isortope-autoresort-input'),
      autoResortContent: this.$el.data('isortope-autoresort-content')
    });

    this.resort = function() {
      this.$el.data('isortope').sortTable();
    };

    this.init();

    // Assign isortope object to HTML element
    this.$el.data('isortope', this);
  }

  //---------- Helper functions ---------------

  // Convert cells for comparison
  function isortopeNumToString(number) {
    // Note: the huge offset is to enable negative numbers to be compared as strings
    number = parseFloat(number) + 450359962737;
    const length = 40; // Create a string of length 40
    let str = number.toString();
    const numDigits = Math.floor(Math.log(number) / Math.LN10);

    for(let i = numDigits; i < length; i++) {
      str = '0' + str;
    }

    return str;
  };

  function isortopeParseString(text) {
    // Remove whitespace
    text = text.replace(/^\s+|\s+$/g, "");

    // Check first word
    const numText = text.split(' ')[0].replace(/[^a-zA-Z0-9\.-]/g, '');

    if (!isNaN(parseFloat(numText))) {
      // Text is a float or integer
      return isortopeNumToString(numText);
    } else {
      // Plain text
      return text.toLowerCase();
    }
  };

  function isortopeCellFilter(element) {
    const text = $(element).text().replace(/^\s+|\s+$/g, '');
    const input = $(element).find('input');

    if (text !== '') {
      // Cell has text
      return isortopeParseString(text);
    } else if (input.length > 0) {
      // If there are inputs
      if (input.val() == 'on') {
        // Check box
        return input.is(':checked').toString();
      } else {
        return isortopeParseString(input.val());
      }
    } else {
      // No text or inputs... sort by raw HTML
      return $(element).html();
    }
  };

  //---------- Main function ---------------
  $.fn.isortope = function(opts) {
    if(opts == 'resort') {
      return this.each(function() {
        const rows = $(this).find('tbody tr');
        $(this).find('tbody').isotope('updateSortData', rows);
        $(this).data('isortope').resort();
      });
    } else {
      return this.each(function() {
        new Isortope(this, opts);
      });
    }
  };

  Isortope.prototype.init = function() {
    const table = this.$el;
    const tbody = table.find('tbody');
    const rows = table.find('tr');

    // Fix position
    table.css('position', 'relative');
    table.css('height', table.height());

    // Fix column width
    const numCols = table.find('th').length;
    for(let col = 0; col < numCols; col++) {
      const colWidth = table.find('tr:first-child td:nth-child(' + (col + 1) + ')').width();
      table.find('tr td:nth-child(' + (col + 1) + ')').css('width', colWidth);

      // Set th width
      const th = table.find('th:nth-child(' + (col + 1) + ')');
      const thWidth = th.width();
      th.css('width', thWidth);
      th.css('max-width', thWidth);
    }

    // Fix row height
    rows.each(function(index, el) {
      $(el).css('height', $(el).height());
    });


    // Create border style wrapping functions for spacing fix
    // All isotope calls should be wrapped in clearBorders() and restoreBorders()
    const cells = tbody.find('td');
    const borderTopHeight = cells.css('border-top-width');
    const borderBottomHeight = cells.css('border-bottom-width');
    const clearBorders = function () {
      cells.css('border-top-width', 0);
      cells.css('border-bottom-width', 0);
    };
    const restoreBorders = function() {
      cells.css('border-top-width', borderTopHeight);
      cells.css('border-bottom-width', borderBottomHeight);
    };

    // If table has 'separate' cells, change the spacing into margins
    if (table.css('border-collapse') == 'separate') {
      const rows = tbody.find('tr');
      const marginSpacing = parseInt(table.css('border-spacing').split(' ')[0]);
      const borderSpacing = parseInt(borderBottomHeight);
      rows.css('margin-bottom', marginSpacing + borderSpacing + 'px');
    }

    // Define sorters
    const sorters = {};

    for(let col = 0; col < numCols; col++) {
      const colClass = 'col' + col;
      const th = table.find('th:nth-child(' + (col + 1) + ')');
      if (th.attr('data-sort-type') != 'none') {
        // const sortFunctionDef = "return isortopeCellFilter(item.find('." + colClass + "'));";
        // const sortFunction = new Function('item', sortFunctionDef);
        const sortFunction = (item) => {
          const cell = item.find('.' + colClass);
          return isortopeCellFilter(cell);
        }
        sorters[colClass] = sortFunction;
        th.attr('data-sort-type', colClass);
        th.css('cursor', 'pointer');
        table.find('tr td:nth-child(' + (col + 1) + ')').addClass(colClass);
        table.find('tr td:nth-child(' + (col + 1) + ')').data('sort-type',colClass);
      }
    }

    // Get yOffset before isotope changes it
    const headerHeight = table.find('thead').offset().top;

    tbody.each(function(index, el) {
      const yOffset = $(el).offset().top - headerHeight;
      $(el).data('offsetHeight', yOffset);
    });

    // Initialize isotope
    clearBorders();

    tbody.each(function(index, el) {
      $(el).isotope({
        itemSelector: 'tr',
        layout: 'fitRows',
        getSortData: sorters
      });
    });

    restoreBorders();

    // Style
    tbody.each(function(index, el) {
      // Restore yOffset
      const yOffset = $(el).data('offsetHeight');
      $(el).find('tr').css('top', yOffset);
    });
    const th = table.find('th');
    th.height(th.height());
    th.css('line-height', 1);

    const removeSortArrow = function() {
      const activeHeader = table.find('th.sortAsc,th.sortDesc');
      activeHeader.find('.sort-arrow').remove();
      activeHeader.removeClass('sortAsc').removeClass('sortDesc');
    };

    // Header click handlers
    table.find('th').click(function() {
      const sort = $(this).attr('data-sort-type');
      if (sort == 'none') {
        return;
      }

      let reverse;

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

      sortTable();
    });

    const sortTable = function() {
      const $th = $(table).find('th.sortAsc, th.sortDesc').closest('th');
      const sort = $th.attr('data-sort-type');
      const reverse = $th.hasClass('sortDesc');

      clearBorders();
      tbody.isotope({
        sortBy: sort,
        sortAscending: !reverse,
      });
      restoreBorders();

      table.trigger('sort');
    };
    this.sortTable = sortTable;

    // Update sort data if fields change
    const cellChanged = function(cell) {
      const parentRow = $(cell).closest('tr');
      tbody.isotope('updateSortData', parentRow);

      const column = $(cell).data('sort-type');
      const columnHeader = $('th[data-sort-type='+column+']');

      // Only re-sort if this column is the sort column
      if(columnHeader.hasClass('sortAsc') || columnHeader.hasClass('sortDesc'))
      {
        sortTable();
      }
    };

    if (this.opts.autoResort && this.opts.autoResortInput) {
      // Update sort data if input value changes
      table.find('input').change(function() {
        const cell=$(this).parent('td');
        cellChanged(cell);
      });
    }

    if (this.opts.autoResort && this.opts.autoResortContent) {
      // Update sort data if cell text changes
      const mutationObserver = new MutationObserver((mutationRecords) => {
        mutationRecords.forEach((mutationRecord) => {
          const cell = $(mutationRecord.target).closest('td');
          cellChanged(cell);
        });
      });
      table.find('td').each((i, el) => {
        mutationObserver.observe(el, {
          childList: true,
          characterData: true,
          subtree: true
        });
      });
    }

    table.trigger('initialized');
  };
})(jQuery, document, window);

$(document).ready(function() {
  $('table.isortope').isortope();
});
