# HTML Style Guide

## Camel case ID and other attribute values

Use camel case for the values of attributes such as IDs and data test subject selectors.

```html
<button
  id="veryImportantButton"
  data-test-subj="clickMeButton"
>
  Click me
</button>
```

The only exception is in cases where you're dynamically creating the value, and you need to use
hyphens as delimiters:

```html
<button
  ng-repeat="button in buttons"
  id="{{ 'veryImportantButton-' + button.id }}"
  data-test-subj="{{ 'clickMeButton-' + button.id }}"
>
  {{ button.label }}
</button>
```

## Capitalization in HTML and CSS should always match

It's important that when you write CSS selectors using classes, IDs, and attributes
(keeping in mind that we should _never_ use IDs and attributes in our selectors), that the
capitalization in the CSS matches that used in the HTML. [HTML and CSS follow different case sensitivity rules](http://reference.sitepoint.com/css/casesensitivity), and we can avoid subtle gotchas by ensuring we use the
same capitalization in both of them.

## Multiple attribute values

When an element has multiple attributes, each attribute including the first should be on its own line with a single indent.
This makes the attributes easier to scan and compare across similar elements.

The closing bracket should be on its own line. This allows attributes to be shuffled and edited without having to move the bracket around. It also makes it easier to scan vertically and match opening and closing brackets. This format
is inspired by the positioning of the opening and closing parentheses in [Pug/Jade](https://pugjs.org/language/attributes.html#multiline-attributes).

```html
<div
  attribute1="value1"
  attribute2="value2"
  attribute3="value3"
>
  Hello
</div>
```

If the element doesn't have children, add the closing tag on the same line as the opening tag's closing bracket.

```html
<div
  attribute1="value1"
  attribute2="value2"
  attribute3="value3"
></div>
```

## Nested elements belong on multiple lines

Putting nested elements on multiple lines makes it easy to scan and identify tags, attributes, and text
nodes, and to distinguish elements from one another. This is especially useful if there are multiple
similar elements which appear sequentially in the markup.

### Do

```html
<div>
  <span>
    hi
  </span>
</div>
```

### Don't

```html
<div><span>hi</span></div>
```

## Leaf element in a nested elements can be in a single line

As per the previous rule, nested elements should be placed on multiple lines. But the leaf element can be placed in a single line, if it does not exeed 140 charecters.

Eg: 1

### Allowed

```html
<div>
  <span>hi</span>
</div>
```

### This is not needed

```html
<div>
  <span>
    hi
  </span>
</div>
```

Eg: 2

### Allowed

```html
<select
  id="rowOperation"
  ng-model="vis.params.cumulativeRowOperation"
>
  <option value="sum">Sum</option>
  <option value="avg">Average</option>
  <option value="min">Min</option>
  <option value="max">Max</option>
</select>
```
### This is not needed

```html
<select
  id="rowOperation"
  ng-model="vis.params.cumulativeRowOperation"
>
  <option value="sum">
    Sum
  </option>
  <option value="avg">
    Average
  </option>
  <option value="min">
    Min
  </option>
  <option value="max">
    Max
  </option>
</select>
```
