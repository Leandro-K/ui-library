export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? "" : value);
  });
  children.flat().forEach((child) => {
    if (child === undefined || child === null || child === false) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

export function button(text, variant = "secondary", onClick, { small = false } = {}) {
  return el("button", {
    type: "button",
    class: "ui-btn ui-btn--" + variant + (small ? " ui-btn--sm" : ""),
    text,
    onClick
  });
}

export function badge(text, variant) {
  return el("span", { class: "ui-badge" + (variant ? " ui-badge--" + variant : ""), text });
}

export function createStore(key, fallback) {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
      } catch (e) {
        return JSON.parse(JSON.stringify(fallback));
      }
    },
    save(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    }
  };
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const dates = {
  parse(value) {
    const [y, m, d] = String(value).split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  },
  today() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  },
  isPast(value) {
    return dates.parse(value) < dates.today();
  },
  format(value, locale) {
    return dates.parse(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  }
};

export const rules = {
  required: (message = "This field is required.") => (v) => (v.length > 0 ? "" : message),
  minLength: (n, message = `Use at least ${n} characters.`) => (v) => (v.length >= n ? "" : message),
  maxLength: (n, message = `Use at most ${n} characters.`) => (v) => (v.length <= n ? "" : message),
  pattern: (re, message = "This value is not valid.") => (v) => (v === "" || re.test(v) ? "" : message),
  date: (message = "This date is not valid.") => (v) =>
    v === "" || !Number.isNaN(dates.parse(v).getTime()) ? "" : message
};

export class FormValidator {
  constructor(form, { fields, onSubmit, messageSuffix = "-msg", invalidClass = "ui-input--invalid" }) {
    this.form = form;
    this.fields = fields;
    this.onSubmit = onSubmit;
    this.messageSuffix = messageSuffix;
    this.invalidClass = invalidClass;
    this.touched = new Set();
    this.names = Object.keys(fields);

    this.names.forEach((name) => {
      const input = form.elements[name];
      const recheck = () => this.touched.has(name) && this.check(name);
      input.addEventListener("blur", () => {
        this.touched.add(name);
        this.check(name);
      });
      input.addEventListener("input", recheck);
      input.addEventListener("change", recheck);
    });

    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this.validate()) return;
      this.onSubmit(this.values());
      form.reset();
    });
    form.addEventListener("reset", () => this.clear());
  }

  value(name) {
    return this.form.elements[name].value.trim();
  }

  values() {
    return Object.fromEntries(this.names.map((name) => [name, this.value(name)]));
  }

  errorFor(name) {
    for (const rule of this.fields[name]) {
      const message = rule(this.value(name));
      if (message) return message;
    }
    return "";
  }

  show(name, message) {
    const input = this.form.elements[name];
    const slot = document.getElementById(input.id + this.messageSuffix);
    if (slot) slot.textContent = message;
    input.classList.toggle(this.invalidClass, Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  check(name) {
    const message = this.errorFor(name);
    this.show(name, message);
    return !message;
  }

  validate() {
    this.names.forEach((name) => this.touched.add(name));
    const invalid = this.names.filter((name) => !this.check(name));
    if (invalid.length) this.form.elements[invalid[0]].focus();
    return invalid.length === 0;
  }

  clear() {
    this.touched.clear();
    this.names.forEach((name) => this.show(name, ""));
  }
}

export class Tabs {
  constructor(root) {
    this.tabs = Array.from(root.querySelectorAll(".ui-tab"));
    this.tabs.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      tab.addEventListener("click", () => this.select(this.panelId(tab)));
      tab.addEventListener("keydown", (event) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        const next = this.tabs[(i + step + this.tabs.length) % this.tabs.length];
        this.select(this.panelId(next), true);
      });
    });
    root.setAttribute("role", "tablist");
    const initial = this.tabs.find((t) => t.classList.contains("ui-tab--active")) || this.tabs[0];
    this.select(this.panelId(initial));
  }

  panelId(tab) {
    return tab.getAttribute("aria-controls");
  }

  select(panelId, focus = false) {
    this.tabs.forEach((tab) => {
      const active = this.panelId(tab) === panelId;
      tab.classList.toggle("ui-tab--active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(this.panelId(tab)).hidden = !active;
      if (active && focus) tab.focus();
    });
  }
}

export function renderTable(tbody, rows, columns, { empty = "No data." } = {}) {
  tbody.replaceChildren();
  if (rows.length === 0) {
    tbody.append(el("tr", {}, el("td", { colspan: columns.length, class: "ui-text-center ui-muted", text: empty })));
    return;
  }
  rows.forEach((row) => tbody.append(el("tr", {}, columns.map((render) => el("td", {}, render(row))))));
}
