/*
* isortope v1.2.3
* Simple, animated JavaScript table sorting
*
* https://github.com/KurtPreston/isortope
*/

// Convert cells for comparison
var isortopeNumToString = function(number) {
  // Note: the huge offset is to enable negative numbers to be compared as strings
  number = parseFloat(number) + 450359962737;
  var length = 40; // Create a string of length 40
  var str = number.toString();
  var numDigits = Math.floor(Math.log(number) / Math.LN10);

  for(var i = numDigits; i < length; i++) {
    str = '0' + str;
  }

  return str;
};

var isortopeParseString = function(text) {
  // Remove whitespace
  text = text.replace(/^\s+|\s+$/g, "");

  // Check first word
  var numText = text.split(' ')[0].replace(/[^a-zA-Z0-9\.-]/g, '');

  if (!isNaN(parseFloat(numText))) {
    // Text is a float or integer
    return isortopeNumToString(numText);
  } else {
    // Plain text
    return text.toLowerCase();
  }
};

var isortopeCellFilter = function(element) {
  var text = $(element).text().replace(/^\s+|\s+$/g, '');
  var input = $(element).find('input');
  var returnVal;

  if (text !== '') {
    // Cell has text
    returnVal = isortopeParseString(text);
  } else if (input.length > 0) {
    // If there are inputs
    if (input.val() == 'on') {
      // Check box
      returnVal = input.is(':checked').toString();
    } else {
      returnVal = isortopeParseString(input.val());
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
  );
  return elms;
};

const mutationObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if(window.watchContentChange){
      for(var i in window.watchContentChange){
        if(window.watchContentChange[i].element.data("lastContents") != window.watchContentChange[i].element.html()){
          window.watchContentChange[i].callback.apply(window.watchContentChange[i].element);
          window.watchContentChange[i].element.data("lastContents", window.watchContentChange[i].element.html());
        }
      }
    }
  });
});

function watchChangeTable(element){
  mutationObserver.observe(element, {
    //attributes: true,
    //characterData: true,
    childList: true,
    subtree: true,
    //attributeOldValue: true,
    //characterDataOldValue: true
  });
}

(function($, doc, win) {
  "use strict";

  function Isortope(el, opts) {
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

  $.fn.isortope = function(opts) {
    if(opts == 'resort') {
      return this.each(function() {
        var rows = $(this).find('tbody tr');
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
    var table = this.$el;
    var tbody = table.find('tbody');
    var rows = table.find('tr');
    watchChangeTable(tbody.prevObject['0'].querySelector('tbody'));

    // Fix position
    table.css('position', 'relative');
    table.css('height', table.height());

    // Fix column width
    var numCols = table.find('th').length;
    for(var col = 0; col < numCols; col++) {
      var colWidth = table.find('tr:first-child td:nth-child(' + (col + 1) + ')').width();
      table.find('tr td:nth-child(' + (col + 1) + ')').css('width', colWidth);

      // Set th width
      var th = table.find('th:nth-child(' + (col + 1) + ')');
      var thWidth = th.width();
      th.css('width', thWidth);
      th.css('max-width', thWidth);
    }

    // Fix row height
    rows.each(function(index, el) {
      $(el).css('height', $(el).height());
    });


    // Create border style wrapping functions for spacing fix
    // All isotope calls should be wrapped in clearBorders() and restoreBorders()
    var cells = tbody.find('td');
    var borderTopHeight = cells.css('border-top-width');
    var borderBottomHeight = cells.css('border-bottom-width');
    var clearBorders = function () {
      cells.css('border-top-width', 0);
      cells.css('border-bottom-width', 0);
    };
    var restoreBorders = function() {
      cells.css('border-top-width', borderTopHeight);
      cells.css('border-bottom-width', borderBottomHeight);
    };

    // If table has 'separate' cells, change the spacing into margins
    if (table.css('border-collapse') == 'separate') {
      var rows = tbody.find('tr');
      var marginSpacing = parseInt(table.css('border-spacing').split(' ')[0]);
      var borderSpacing = parseInt(borderBottomHeight);
      rows.css('margin-bottom', marginSpacing + borderSpacing + 'px');
    }

    // Define sorters
    var sorters = {};

    for(var col = 0; col < numCols; col++) {
      var colClass = 'col' + col;
      var th = table.find('th:nth-child(' + (col + 1) + ')');
      if (th.attr('data-sort-type') != 'none') {
        var sortFunctionDef = "return isortopeCellFilter(item.find('." + colClass + "'));";
        var sortFunction = new Function('item', sortFunctionDef);
        sorters[colClass] = sortFunction;
        th.attr('data-sort-type', colClass);
        th.css('cursor', 'pointer');
        table.find('tr td:nth-child(' + (col + 1) + ')').addClass(colClass);
        table.find('tr td:nth-child(' + (col + 1) + ')').data('sort-type',colClass);
      }
    }

    // Get yOffset before isotope changes it
    var headerHeight = table.find('thead').offset().top;

    tbody.each(function(index, el) {
      var yOffset = $(el).offset().top - headerHeight;
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
      var yOffset = $(el).data('offsetHeight');
      $(el).find('tr').css('top', yOffset);
    });
    var th = table.find('th');
    th.height(th.height());
    th.css('line-height', 1);

    var removeSortArrow = function() {
      var activeHeader = table.find('th.sortAsc,th.sortDesc');
      activeHeader.find('.sort-arrow').remove();
      activeHeader.removeClass('sortAsc').removeClass('sortDesc');
    };

    // Header click handlers
    table.find('th').click(function() {
      var sort = $(this).attr('data-sort-type');
      if (sort == 'none') {
        return;
      }

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

      sortTable();
    });

    var sortTable = function() {
      var $th = $(table).find('th.sortAsc, th.sortDesc').closest('th');
      var sort = $th.attr('data-sort-type');
      var reverse = $th.hasClass('sortDesc');

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
    var cellChanged = function(cell) {
      var parentRow = $(cell).closest('tr');
      tbody.isotope('updateSortData', parentRow);

      var column = $(cell).data('sort-type');
      var columnHeader = $('th[data-sort-type='+column+']');

      // Only re-sort if this column is the sort column
      if(columnHeader.hasClass('sortAsc') || columnHeader.hasClass('sortDesc'))
      {
        sortTable();
      }
    };

    if (this.opts.autoResort && this.opts.autoResortInput) {
      // Update sort data if input value changes
      table.find('input').change(function() {
        var cell=$(this).parent('td');
        cellChanged(cell);
      });
    }

    if (this.opts.autoResort && this.opts.autoResortContent) {
      // Update sort data if cell text changes
      table.find('td').contentChange( function(){
        cellChanged(this);
      });
    }

    table.trigger('initialized');
  };
})(jQuery, document, window);

$(document).ready(function() {
  $('table.isortope').isortope();
});
