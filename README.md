# Harrix-ListWithFilter.js

Filterable hierarchical list component for the browser. No dependencies.

## Installation

```bash
npm install harrix-list-with-filter
```

Or include the UMD build directly via `<script>` tag (see [Usage via script tag](#usage-via-script-tag)).

## Usage

### ES module

```javascript
import ListWithFilter from 'harrix-list-with-filter';
import 'harrix-list-with-filter/dist/style.css';

new ListWithFilter('#root_tree', '#filter');
```

### Usage via script tag

```html
<link rel="stylesheet" href="dist/harrix-list-with-filter.css" />
<script src="dist/list-with-filter.umd.js"></script>
<script>
  new ListWithFilter('#root_tree', '#filter');
</script>
```

### HTML structure

```html
<input id="filter" type="text" placeholder="Search..." />
<ul id="root_tree">
  <li>
    Category A
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </li>
  <li>
    Category B
    <ul>
      <li>Item 3</li>
      <li>Item 4</li>
    </ul>
  </li>
</ul>
```

## API

### Constructor

```javascript
new ListWithFilter(listSelector, inputSelector, options);
```

| Parameter       | Type               | Description                                   |
| --------------- | ------------------ | --------------------------------------------- |
| `listSelector`  | `string \| Element` | CSS selector or DOM element for the `<ul>` list |
| `inputSelector` | `string \| Element` | CSS selector or DOM element for the `<input>`   |
| `options`       | `object`           | Configuration options (optional)              |

### Options

| Option                         | Type       | Default     | Description                                                        |
| ------------------------------ | ---------- | ----------- | ------------------------------------------------------------------ |
| `changeCursor`                 | `boolean`  | `true`      | Change cursor to pointer on leaf items                             |
| `collapsedStart`               | `string`   | `'none'`    | Initial collapse state: `'none'`, `'all'`, `'close-last-ul'`, `'first-open'` |
| `countItems`                   | `string`   | `'none'`    | Show item count: `'none'`, `'all-li'`, `'only-leafs'`             |
| `countItemsInFilter`           | `string`   | `'none'`    | Count behavior when filtering: `'none'`, `'not-changed'`, `'changed'` |
| `functionSearch`               | `function` | `includes`  | Custom search function `(text, query) => boolean`                  |
| `listStyle`                    | `string`   | `'default'` | List style: `'default'`, `'none'`, `'arrows'`                     |
| `paddingLi`                    | `string`   | `'default'` | Padding mode: `'default'`, `'left-leafs'`, `'none'`               |
| `rememberStateBeforeFiltering` | `boolean`  | `true`      | Restore collapse state after clearing filter                       |
| `searchBy`                     | `string`   | `'content'` | Search by: `'content'` (text) or `'value'` (`data-value` attribute) |
| `showCollapsedExpandedAll`     | `boolean`  | `false`     | Show expand/collapse all buttons                                   |
| `showFilterResults`            | `string`   | `'default'` | Filter display mode: `'default'`, `'with-sublists'`, `'only-leafs'` |
| `showZeroCountItems`           | `boolean`  | `true`      | Show count badge when count is zero                                |
| `clearButton`                  | `string \| Element` | `null` | Selector or element for "clear filter" button                |
| `expandButton`                 | `string \| Element` | `null` | Selector or element for "expand all" button                  |
| `collapseButton`               | `string \| Element` | `null` | Selector or element for "collapse all" button                |
| `noResults`                    | `string \| Element` | `null` | Selector or element for "no results" message                 |
| `onlyLeavesContainer`          | `string \| Element` | `null` | Selector or element for leaf-only results container          |
| `buttonsContainer`             | `string \| Element` | `null` | Selector or element for buttons wrapper                      |

### Methods

| Method         | Description                                |
| -------------- | ------------------------------------------ |
| `expandAll()`  | Expand all nested lists                    |
| `collapseAll()`| Collapse all nested lists                  |
| `clearFilter()`| Clear filter input and restore list state  |
| `destroy()`    | Remove all event listeners                 |

### Example with options

```javascript
const list = new ListWithFilter('#root_tree', '#filter', {
  collapsedStart: 'all',
  countItems: 'only-leafs',
  listStyle: 'arrows',
  clearButton: '#clear-btn',
  expandButton: '#expand-btn',
  collapseButton: '#collapse-btn',
  noResults: '#no-results',
});
```

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build library to dist/
```

## License

MIT
