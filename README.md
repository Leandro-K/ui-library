# ui-library

A small, reusable UI library: one CSS file (`ui.css`) and one JavaScript module (`ui.js`).
Nothing in it is specific to any app, so any project can use it.

## Install

Load it from the jsDelivr CDN (use `@main`, or pin a commit hash for a fixed version):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Leandro-K/ui-library@main/ui.css">
<script type="module">
  import { FormValidator, rules } from "https://cdn.jsdelivr.net/gh/Leandro-K/ui-library@main/ui.js";
</script>
```

## CSS — `ui.css`

Every class starts with `ui-`.
Colors, spacing and radius are CSS variables (`--ui-*`) on `:root`, so a theme can override them.

| Group | Classes |
|---|---|
| Page & layout | `ui-page`, `ui-container`, `ui-row`, `ui-grid`, `ui-scroll-x` |
| Text | `ui-h1`, `ui-h2`, `ui-muted`, `ui-small`, `ui-strong`, `ui-block`, `ui-text-center` |
| Spacing | `ui-m-0`, `ui-mb-4`, `ui-mb-5`, `ui-mt-5` |
| Card | `ui-card` |
| Forms | `ui-field`, `ui-label`, `ui-field-row`, `ui-input`, `ui-input--invalid`, `ui-field-msg` |
| Buttons | `ui-btn` + `ui-btn--primary` / `--secondary` / `--danger`, size `ui-btn--sm` |
| Table | `ui-table` |
| Badges | `ui-badge` + `ui-badge--success` / `--warning` / `--danger` |
| Tabs | `ui-tabs`, `ui-tab`, `ui-tab--active`, `ui-tab-panel` |
| Stats | `ui-stat`, `ui-stat--danger`, `ui-stat-label`, `ui-stat-value` |

### Form field with a message beside it

```html
<div class="ui-field">
  <label class="ui-label" for="email">Email</label>
  <div class="ui-field-row">
    <input class="ui-input" id="email" name="email">
    <span class="ui-field-msg" id="email-msg"></span>
  </div>
</div>
```

## JavaScript — `ui.js`

An ES module. Import only what you need:

```js
import { el, button, badge, createStore, uid, dates, rules, FormValidator, Tabs, renderTable } from "https://cdn.jsdelivr.net/gh/Leandro-K/ui-library@main/ui.js";
```

| Export | What it does |
|---|---|
| `el(tag, attrs, ...children)` | Creates an element. `class`, `text` and `onClick`-style handlers are supported. |
| `button(text, variant, onClick, { small })` | A `ui-btn` button (`primary`, `secondary`, `danger`). |
| `badge(text, variant)` | A `ui-badge` (`success`, `warning`, `danger`). |
| `createStore(key, fallback)` | `load()` / `save(value)` to `localStorage` as JSON. |
| `uid()` | A short unique id. |
| `dates` | `parse("YYYY-MM-DD")`, `today()`, `isPast(value)`, `format(value)`. |
| `rules` | Validation rules: `required`, `minLength`, `maxLength`, `pattern`, `date` — each takes a custom message. |
| `new FormValidator(form, { fields, onSubmit })` | Validates on submit and on blur/input, shows each message in the element with id `<input id>-msg` beside the field. |
| `new Tabs(root)` | Turns `.ui-tab` buttons (with `aria-controls`) into tabs. `select(panelId)` switches tab. |
| `renderTable(tbody, rows, columns, { empty })` | Renders rows; each column is a function `row => text or element`. |

### Example

```js
new FormValidator(document.getElementById("signup"), {
  fields: {
    email: [rules.required("Enter your email."), rules.pattern(/@/, "That is not an email.")]
  },
  onSubmit: (values) => console.log(values)
});
```

## Used by

- [book-lending-tracker](https://github.com/Leandro-K/book-lending-tracker)
