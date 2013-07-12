isortope
========

Simple, animated JavaScript table sorting with support for numbers, fields, currency, and percents.  Based on [Isotope](http://isotope.metafizzy.co/).

[Download isortope-min.js](https://raw.github.com/KurtPreston/isortope/master/isortope-min.js)

Demo
----
View a live demo [here](http://www.kurtpreston.com/isortope).

![](https://raw.github.com/KurtPreston/isortope/master/demo/isortope.gif)

Use
---
### Requirements
Load [jQuery](http://jquery.com/) and [Isotope](http://isotope.metafizzy.co/) before loading **isortope**.

```javascript
<script src='jquery.js' />
<script src='jquery.isotope.js' />
<script src='isortope.js' />
```

### Initializing isortope
There are two ways to initialize isortope:

You can add the class `isortope` to any HTML table:
```html
<table class='isortope'>
  ...
</table>
```

Or, you can call `.isortope()` on any jQuery-selected table.  This can be useful if loading over AJAX:
```javascript
  $('table#my-table').isortope();
```

### Configuration

By default, Isortope will monitor your table for any changes to cells.  You can disable this behavior either via HTML attributes, or on initialization via Javascript.

By HTML attributes:
+ **data-isortope-autoresort**: if false, disable auto re-sorting when input or cell contents change
+ **data-isortope-autoresort-input**: if false, disable monitoring input changes
+ **data-isortope-autoresort-content**: if false, disable monitoring HTML content changes

HTML Example:
```html
<table class='isortope' data-isortope-autoresort='false'>
  ...
</table>
```

By JavaScript on initialization:
+ **autoResort**: if false, disable auto re-sorting when input or cell contents change
+ **autoResortInput**: if false, disable monitoring input changes
+ **autoResortContent**: if false, disable monitoring HTML content changes

JavaScript example:
```javascript
  $('table#my-table').isortope({autoResort: false});
```

Additionally, you can disable sorting on specific columns by setting the attribute ```data-sort-type``` to ```'none'``` on the ```th``` element.  Example:

```html
  <table>
    <thead>
      <th>Sortable Column</th>
      <th data-sort-type='none'>Non-sortable Column</th>
    </thead>
    …
  </table>
```

### Animation
To enable animations, add the [Isotope animation styles](http://isotope.metafizzy.co/docs/animating.html) to your stylesheet:

```css
.isotope,
.isotope .isotope-item {
  /* change duration value to whatever you like */
  -webkit-transition-duration: 0.8s;
     -moz-transition-duration: 0.8s;
      -ms-transition-duration: 0.8s;
       -o-transition-duration: 0.8s;
          transition-duration: 0.8s;
}

.isotope {
  -webkit-transition-property: height, width;
     -moz-transition-property: height, width;
      -ms-transition-property: height, width;
       -o-transition-property: height, width;
          transition-property: height, width;
}

.isotope .isotope-item {
  -webkit-transition-property: -webkit-transform, opacity;
     -moz-transition-property:    -moz-transform, opacity;
      -ms-transition-property:     -ms-transform, opacity;
       -o-transition-property:      -o-transform, opacity;
          transition-property:         transform, opacity;
}

/**** disabling Isotope CSS3 transitions ****/

.isotope.no-transition,
.isotope.no-transition .isotope-item,
.isotope .isotope-item.no-transition {
  -webkit-transition-duration: 0s;
     -moz-transition-duration: 0s;
      -ms-transition-duration: 0s;
       -o-transition-duration: 0s;
          transition-duration: 0s;
}
```

### Events

**isortope** fires events after initialization and when sorting. You can hook into these events with jQuery:

```javascript
  $('table.isortope').on('sort', function() {...});

  $('table.isortope').on('initialized', function() {...});
```

Changelog
---
+ **v.1.1**
  - auto re-sort when table data changes
  - bug fixes
+ **v.1.0**
  - public release
  - supports numbers, percents, currency, and form inputs
  - simple demo.html
