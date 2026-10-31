const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(`${__dirname}/dist/app.js`, 'utf8');
const data = new Map();
function boot({ failStorage = false } = {}) {
  class Element {
    constructor() { this.children = []; this.attributes = {}; this.listeners = {}; this.style = {}; this.value = ''; this.hidden = false; this.dataset = {}; this.classList = { toggle() {} }; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    setAttribute(k, v) { this.attributes[k] = v; }
    removeAttribute(k) { delete this.attributes[k]; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    focus() {} scrollIntoView() {}
    click() { this.listeners.click?.(); }
  }
  const nodes = new Map();
  const get = s => { if (!nodes.has(s)) nodes.set(s, new Element()); return nodes.get(s); };
  const filters = ['all', 'pending', 'completed'].map(name => { const e = new Element(); e.dataset.filter = name; return e; });
  get('#task-form').reset = () => { get('#task-title').value = ''; get('#task-subject').value = ''; };
  const document = {
    querySelector: s => s === '[data-filter].selected' ? filters[0] : get(s),
    querySelectorAll: s => s === '[data-filter]' ? filters : get('#task-list').children.map(row => row.children[s === '.task-toggle' ? 0 : 2]),
    createElement: () => new Element()
  };
  vm.runInNewContext(source, { document, localStorage: { getItem: k => data.get(k) || null, setItem: (k, v) => { if (failStorage) throw new Error('Storage full'); data.set(k, v); } }, crypto: require('node:crypto'), Intl, Date, setTimeout: () => 1, clearTimeout() {} });
  return { get, filters, add(title, subject = '') { get('#task-title').value = title; get('#task-subject').value = subject; get('#task-form').listeners.submit({ preventDefault() {} }); } };
}
let app = boot();
assert.equal(app.get('#empty-state').hidden, false);
app.add('   ');
assert.equal(app.get('#title-error').hidden, false);
assert.equal(app.get('#task-list').children.length, 0);
app.add('  Revise chapter 3  ', 'Computing');
assert.equal(app.get('#task-list').children[0].children[1].children[0].textContent, 'Revise chapter 3');
assert.equal(app.get('#task-list').children[0].children[1].children[1].textContent, 'Computing');
app.get('#task-list').children[0].children[0].click();
assert.equal(app.get('#done-count').textContent, 1);
assert.equal(app.get('#progress-bar').style.width, '100%');
app = boot();
assert.equal(app.get('#task-list').children.length, 1);
assert.equal(app.get('#done-count').textContent, 1);
app.filters[1].click();
assert.equal(app.get('#task-list').children.length, 0);
app.filters[2].click();
assert.equal(app.get('#task-list').children.length, 1);
app.get('#task-list').children[0].children[0].click();
assert.equal(app.get('#pending-count').textContent, 1);
app.filters[0].click();
app.add('<img src=x onerror=alert(1)>');
assert.equal(app.get('#task-list').children[0].children[1].children[0].textContent, '<img src=x onerror=alert(1)>');
app.get('#task-list').children[0].children[2].click();
app.get('#task-list').children[0].children[2].click();
assert.equal(app.get('#task-list').children.length, 0);
assert.equal(boot().get('#task-list').children.length, 0);
app = boot({ failStorage: true });
app.add('Unsaved task');
assert.equal(app.get('.local-badge').textContent, 'Changes not saved');
data.set('studyspace.tasks.v1', '{bad data');
assert.equal(boot().get('#task-list').children.length, 0);
console.log('PASS: empty state, blank validation, add/trim, course, completion, reopen, filters, incomplete toggle, safe text rendering, delete persistence, storage failure, corrupt storage.');
