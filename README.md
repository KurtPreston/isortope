isortope
========

Simple, animated JavaScript table sorting with support for numbers, fields, currency, and percents.  Based on [Isotope](http://isotope.metafizzy.co/).

Use
---
### Requirements
Load [jQuery](http://jquery.com/) and [Isotope](http://isotope.metafizzy.co/) before loading **isortope**.

```javascript
<script src='jquery.js' />
<script src='jquery.isotope.js' />
<script src='isortope.js' />
```

### Style
To enable animations, add the [Isotope animation styles](http://isotope.metafizzy.co/docs/animating.html) to your stylesheet.  Below is an abbreviated list:

```css
.isotope,
.isotope .isotope-item {
  transition-duration: 0.8s;
}

.isotope {
  transition-property: height, width;
}

.isotope .isotope-item {
  transition-property: transform, opacity;
}

.isotope.no-transition,
.isotope.no-transition .isotope-item,
.isotope .isotope-item.no-transition {
  transition-duration: 0s;
}
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

Changelog
---
+ **v.1.0**
  - public release
  - supports numbers, percents, currency, and form inputs
  - simple demo.html
