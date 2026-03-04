/**
 * ListWithFilter - filterable hierarchical list component.
 * @license MIT
 * @see https://github.com/Harrix/Harrix-ListWithFilter.js
 */

import './list-with-filter.css';

class ListWithFilter {
  static defaults = {
    changeCursor: true,
    collapsedStart: 'none',
    countItems: 'none',
    countItemsInFilter: 'none',
    functionSearch: null,
    listStyle: 'default',
    paddingLi: 'default',
    rememberStateBeforeFiltering: true,
    searchBy: 'content',
    showCollapsedExpandedAll: false,
    showFilterResults: 'default',
    showZeroCountItems: true,
    clearButton: null,
    expandButton: null,
    collapseButton: null,
    noResults: null,
    onlyLeavesContainer: null,
    buttonsContainer: null,
  };

  constructor(listSelector, inputSelector, options = {}) {
    this._ul = this._resolveElement(listSelector);
    this._input = this._resolveElement(inputSelector);

    if (!this._ul || !this._input) {
      throw new Error('ListWithFilter: list or input element not found');
    }

    this._settings = { ...ListWithFilter.defaults, ...options };
    this._settings.functionSearch ??= (text, query) => text.includes(query);

    this._clearBtn = this._resolveElement(this._settings.clearButton);
    this._expandBtn = this._resolveElement(this._settings.expandButton);
    this._collapseBtn = this._resolveElement(this._settings.collapseButton);
    this._noResultsEl = this._resolveElement(this._settings.noResults);
    this._onlyLeavesEl = this._resolveElement(this._settings.onlyLeavesContainer);
    this._buttonsEl = this._resolveElement(this._settings.buttonsContainer);

    this._liForCount = null;
    this._boundHandlers = {};
    this._init();
  }

  // --- Public API ---

  expandAll() {
    for (const sub of this._ul.querySelectorAll('ul')) {
      this._show(sub);
      sub.dataset.collapse = 'false';
      sub.dataset.collapseHistory = 'false';
    }
    this._traverseList(this._ul.children, (el) => this._distributeCollapsedExpanded(el));
  }

  collapseAll() {
    for (const sub of this._ul.querySelectorAll('ul')) {
      this._hide(sub);
      sub.dataset.collapse = 'true';
      sub.dataset.collapseHistory = 'true';
    }
    this._traverseList(this._ul.children, (el) => this._distributeCollapsedExpanded(el));
  }

  clearFilter() {
    this._input.value = '';
    this._handleFilterChange();
    this._input.focus();
  }

  destroy() {
    this._ul.removeEventListener('click', this._boundHandlers.click);
    this._input.removeEventListener('input', this._boundHandlers.input);
    this._input.removeEventListener('paste', this._boundHandlers.paste);
    this._expandBtn?.removeEventListener('click', this._boundHandlers.expand);
    this._collapseBtn?.removeEventListener('click', this._boundHandlers.collapse);
    this._clearBtn?.removeEventListener('click', this._boundHandlers.clear);
  }

  // --- Initialization ---

  _init() {
    this._setCollapsedStart();
    this._applyListStyle();

    if (this._settings.showCollapsedExpandedAll && this._buttonsEl) {
      this._show(this._buttonsEl);
    }

    this._traverseList(this._ul.children, (el) => this._workWithElement(el));
    this._traverseList(this._ul.children, (el) => this._initCountItems(el));
    this._traverseList(this._ul.children, (el) => this._distributeCollapsedExpanded(el));
    this._setupEvents();
  }

  _applyListStyle() {
    const lis = this._ul.querySelectorAll('li');
    const { listStyle } = this._settings;

    if (listStyle === 'default') {
      for (const li of lis) li.style.listStyle = 'inherit';
    } else if (listStyle === 'none' || listStyle === 'arrows') {
      for (const li of lis) li.style.listStyle = 'none';
      this._ul.style.paddingLeft = '0';
    }
  }

  _setCollapsedStart() {
    const subUls = this._ul.querySelectorAll('ul');
    const { collapsedStart } = this._settings;

    if (collapsedStart === 'all') {
      for (const sub of subUls) this._setCollapseState(sub, true);
    } else if (collapsedStart === 'none') {
      for (const sub of subUls) this._setCollapseState(sub, false);
    } else if (collapsedStart === 'close-last-ul') {
      for (const sub of subUls) {
        this._setCollapseState(sub, sub.querySelector('ul') === null);
      }
    } else if (collapsedStart === 'first-open') {
      for (const sub of subUls) this._setCollapseState(sub, true);
      for (const child of this._ul.children) {
        if (child.tagName === 'LI') {
          for (const inner of child.children) {
            if (inner.tagName === 'UL') this._setCollapseState(inner, false);
          }
        }
      }
    }
  }

  _workWithElement(el) {
    if (this._settings.changeCursor) {
      if (el.tagName === 'LI') {
        el.style.cursor = this._isLeaf(el) ? 'pointer' : 'default';
      } else if (el.tagName !== 'UL') {
        const parentLi = el.closest('li');
        el.style.cursor = parentLi && this._isLeaf(parentLi) ? 'pointer' : 'default';
      }
    }

    if (this._settings.paddingLi === 'left-leafs' && el.tagName === 'LI' && this._isLeaf(el)) {
      el.classList.add('padding-left');
    }
    if (this._settings.paddingLi === 'none') {
      el.style.paddingLeft = '0';
    }
  }

  // --- Events ---

  _setupEvents() {
    this._boundHandlers.click = (e) => this._toggleUl(e);
    this._ul.addEventListener('click', this._boundHandlers.click);

    this._boundHandlers.input = () => this._handleFilterChange();
    this._input.addEventListener('input', this._boundHandlers.input);

    this._boundHandlers.paste = () => setTimeout(() => this._handleFilterChange(), 100);
    this._input.addEventListener('paste', this._boundHandlers.paste);

    if (this._expandBtn) {
      this._boundHandlers.expand = () => this.expandAll();
      this._expandBtn.addEventListener('click', this._boundHandlers.expand);
    }
    if (this._collapseBtn) {
      this._boundHandlers.collapse = () => this.collapseAll();
      this._collapseBtn.addEventListener('click', this._boundHandlers.collapse);
    }
    if (this._clearBtn) {
      this._boundHandlers.clear = () => this.clearFilter();
      this._clearBtn.addEventListener('click', this._boundHandlers.clear);
    }
  }

  // --- Toggle / Collapse ---

  _toggleUl(event) {
    const filter = this._input.value.toLowerCase();
    const target = event.target;

    if (target.tagName === 'LI') {
      for (const child of target.children) {
        if (child.tagName === 'UL') {
          this._toggle(child);
          this._toggleDataAttr(child, 'collapse', 'true', 'false');
          if (!filter.trim() || !this._settings.rememberStateBeforeFiltering) {
            child.dataset.collapseHistory = child.dataset.collapse;
          }
          this._toggleCollapsedExpanded(target, child);
        }
      }
    } else if (target.tagName !== 'UL') {
      const li = target.closest('li');
      if (!li) return;
      const childUl = li.querySelector(':scope > ul');
      if (!childUl) return;

      this._toggle(childUl);
      this._toggleDataAttr(childUl, 'collapse', 'true', 'false');
      if (!filter.trim() || !this._settings.rememberStateBeforeFiltering) {
        childUl.dataset.collapseHistory = childUl.dataset.collapse;
      }
      this._toggleCollapsedExpanded(li, childUl);
    }
  }

  _toggleCollapsedExpanded(li, ulList) {
    if (this._settings.listStyle !== 'arrows') return;
    if (!li.classList.contains('collapsed') && !li.classList.contains('expanded')) return;

    if (ulList.dataset.collapse === 'true') {
      li.classList.add('collapsed');
      li.classList.remove('expanded');
    } else {
      li.classList.add('expanded');
      li.classList.remove('collapsed');
    }
  }

  _distributeCollapsedExpanded(el) {
    if (el.tagName !== 'LI' || this._isLeaf(el)) return;

    const childUl = el.querySelector('ul');
    if (!childUl) return;

    if (childUl.dataset.collapse === 'true') {
      el.classList.add('collapsed');
      el.classList.remove('expanded');
    } else {
      el.classList.add('expanded');
      el.classList.remove('collapsed');
    }
  }

  _returnStateCollapse(el) {
    if (el.tagName === 'UL' && el !== this._ul) {
      if (el.dataset.collapseHistory === 'true') {
        this._hide(el);
        el.dataset.collapse = 'true';
      } else {
        this._show(el);
        el.dataset.collapse = 'false';
      }
    } else if (el.tagName === 'LI') {
      this._show(el);
    }
  }

  // --- Count items ---

  _initCountItems(el) {
    if (el.tagName === 'LI') {
      this._liForCount = el;
      return;
    }
    if (el.tagName !== 'UL') return;

    const { countItems, showZeroCountItems } = this._settings;
    if (countItems === 'none') return;

    let count = 0;
    if (countItems === 'all-li') {
      count = el.querySelectorAll('li').length;
    } else if (countItems === 'only-leafs') {
      for (const li of el.querySelectorAll('li')) {
        if (li.querySelector('ul') === null) count++;
      }
    }

    if (showZeroCountItems || count > 0) {
      const span = document.createElement('span');
      span.className = 'count-li';
      span.dataset.count = count;
      span.textContent = count;
      this._liForCount?.prepend(span);
    }
  }

  _updateCountItems(el) {
    if (el.tagName === 'LI') {
      this._liForCount = el;
      return;
    }
    if (el.tagName !== 'UL' || this._isHidden(el)) return;

    const { countItems, showZeroCountItems } = this._settings;
    let count = 0;

    if (countItems === 'all-li') {
      count = this._getVisibleLis(el).length;
    } else if (countItems === 'only-leafs') {
      for (const li of this._getVisibleLis(el)) {
        const hasVisibleSubUl = [...li.querySelectorAll('ul')].some((u) => !this._isHidden(u));
        if (!hasVisibleSubUl) count++;
      }
    }

    if (showZeroCountItems || count > 0) {
      const countSpan = this._liForCount?.querySelector('.count-li');
      if (countSpan) countSpan.textContent = count;
    }
  }

  _updateCountItemsFilterResults() {
    for (const found of this._ul.querySelectorAll('[data-find="true"]')) {
      for (const span of found.querySelectorAll('.count-li')) {
        span.textContent = span.dataset.count;
      }
    }

    for (const li of this._ul.querySelectorAll('li')) {
      if (li.closest('[data-find="true"]')) continue;
      if (this._isLeaf(li)) continue;

      let count = 0;
      for (const childLi of li.querySelectorAll('li')) {
        if (!this._isHidden(childLi)) {
          if (this._settings.countItems === 'only-leafs' && this._isLeaf(childLi)) count++;
          if (this._settings.countItems === 'all-li') count++;
        }
      }
      const countSpan = li.querySelector(':scope > .count-li');
      if (countSpan) countSpan.textContent = count;
    }
  }

  // --- Filtering ---

  _doFilter(obj, filter) {
    let showObj = false;

    for (const child of obj.children) {
      if (child.tagName !== 'LI') continue;

      let show = this._checkChildren([...child.children], filter);
      if (!show) {
        const text = this._getSearchText(child).toLowerCase();
        show = this._settings.functionSearch(text, filter);
      }

      if (show) {
        showObj = true;
        this._show(child);
      } else {
        this._hide(child);
      }
    }

    if (obj.tagName === 'LI') {
      showObj ? this._show(obj) : this._hide(obj);
    }
    return showObj;
  }

  _checkChildren(children, filter) {
    let show = false;
    for (const child of children) {
      if (this._doFilter(child, filter)) show = true;
    }
    return show;
  }

  _handleFilterChange() {
    const filter = this._input.value.toLowerCase();

    for (const li of this._ul.querySelectorAll('li')) {
      delete li.dataset.find;
    }

    if (filter.trim()) {
      this._applyFilter(filter);
    } else {
      this._clearFilterState();
    }
  }

  _applyFilter(filter) {
    if (this._clearBtn) this._clearBtn.style.display = 'block';
    if (this._settings.showCollapsedExpandedAll && this._buttonsEl) {
      this._hide(this._buttonsEl);
    }

    if (this._settings.showFilterResults !== 'only-leafs') {
      this._filterTree(filter);
    } else {
      this._filterOnlyLeafs(filter);
    }
  }

  _filterTree(filter) {
    if (this._onlyLeavesEl) this._hide(this._onlyLeavesEl);

    this._doFilter(this._ul, filter);
    for (const sub of this._ul.querySelectorAll('ul')) this._show(sub);
    this._show(this._ul);

    for (const li of this._getVisibleLis(this._ul)) {
      const hasVisibleChildren = this._getVisibleLis(li).length > 0;
      if (li.classList.contains('collapsed') || li.classList.contains('expanded')) {
        li.classList.toggle('expanded', hasVisibleChildren);
        li.classList.toggle('collapsed', !hasVisibleChildren);
      }
    }

    for (const li of this._getVisibleLis(this._ul)) {
      const text = this._getSearchText(li).toLowerCase();
      if (this._settings.functionSearch(text, filter)) {
        li.dataset.find = 'true';
      }
    }

    if (this._getVisibleLis(this._ul).length === 0) {
      this._hide(this._ul);
      if (this._noResultsEl) this._show(this._noResultsEl);
    } else {
      this._show(this._ul);
      if (this._noResultsEl) this._hide(this._noResultsEl);
    }

    if (this._settings.showFilterResults === 'with-sublists') {
      this._applyWithSublistsMode();
    }

    this._handleCountItemsInFilter();

    if (!this._settings.rememberStateBeforeFiltering) {
      for (const sub of this._ul.querySelectorAll('ul')) {
        sub.dataset.collapseHistory = sub.dataset.collapse;
      }
    }
  }

  _applyWithSublistsMode() {
    for (const found of this._ul.querySelectorAll('[data-find="true"]')) {
      for (const sub of found.querySelectorAll('ul')) {
        if (sub.querySelector('[data-find="true"]')) {
          this._show(sub);
          sub.dataset.collapse = 'false';
        } else {
          this._hide(sub);
          sub.dataset.collapse = 'true';
        }
      }
      this._show(found);
      for (const li of found.querySelectorAll('li')) this._show(li);
    }

    for (const sub of this._ul.querySelectorAll('ul')) {
      if (this._getRenderedLis(sub).length > 0) {
        this._show(sub);
        sub.dataset.collapse = 'false';
      }
    }

    this._traverseList(this._ul.children, (el) => this._distributeCollapsedExpanded(el));
  }

  _handleCountItemsInFilter() {
    const { countItemsInFilter, showFilterResults } = this._settings;

    if (countItemsInFilter === 'none') {
      for (const span of this._ul.querySelectorAll('.count-li')) this._hide(span);
    } else if (countItemsInFilter === 'changed') {
      if (showFilterResults === 'with-sublists') {
        this._updateCountItemsFilterResults();
      } else {
        this._traverseList(this._ul.children, (el) => this._updateCountItems(el));
      }
    }
  }

  _filterOnlyLeafs(filter) {
    this._hide(this._ul);
    if (!this._onlyLeavesEl) return;

    this._onlyLeavesEl.innerHTML = '';
    this._show(this._onlyLeavesEl);

    for (const li of this._ul.querySelectorAll('li')) {
      if (!this._isLeaf(li)) continue;
      const text = this._getSearchText(li).toLowerCase();
      if (this._settings.functionSearch(text, filter)) {
        li.dataset.find = 'true';
        this._onlyLeavesEl.appendChild(li.cloneNode(true));
      }
    }

    if (this._onlyLeavesEl.querySelectorAll('li').length === 0) {
      this._hide(this._onlyLeavesEl);
      if (this._noResultsEl) this._show(this._noResultsEl);
    } else {
      this._show(this._onlyLeavesEl);
      if (this._noResultsEl) this._hide(this._noResultsEl);
    }
  }

  _clearFilterState() {
    this._traverseList(this._ul.children, (el) => this._returnStateCollapse(el));
    this._traverseList(this._ul.children, (el) => this._distributeCollapsedExpanded(el));

    for (const span of this._ul.querySelectorAll('.count-li')) {
      this._show(span);
      span.textContent = span.dataset.count;
    }

    if (this._noResultsEl) this._hide(this._noResultsEl);
    this._show(this._ul);

    if (this._settings.showFilterResults === 'only-leafs' && this._onlyLeavesEl) {
      this._onlyLeavesEl.innerHTML = '';
      this._hide(this._onlyLeavesEl);
    }

    if (this._clearBtn) this._clearBtn.style.display = 'none';
    if (this._settings.showCollapsedExpandedAll && this._buttonsEl) {
      this._show(this._buttonsEl);
    }
  }

  // --- Utility methods ---

  _resolveElement(selectorOrElement) {
    if (!selectorOrElement) return null;
    if (typeof selectorOrElement === 'string') return document.querySelector(selectorOrElement);
    if (selectorOrElement instanceof Element) return selectorOrElement;
    return null;
  }

  _show(el) {
    el.style.display = '';
  }

  _hide(el) {
    el.style.display = 'none';
  }

  _toggle(el) {
    this._isHidden(el) ? this._show(el) : this._hide(el);
  }

  _isHidden(el) {
    return el.style.display === 'none';
  }

  _setCollapseState(el, collapsed) {
    collapsed ? this._hide(el) : this._show(el);
    el.dataset.collapse = String(collapsed);
    el.dataset.collapseHistory = String(collapsed);
  }

  _toggleDataAttr(el, name, a, b) {
    el.dataset[name] = el.dataset[name] === a ? b : a;
  }

  _traverseList(elements, callback) {
    const snapshot = [...elements];
    for (const el of snapshot) {
      callback(el);
      if (el.children.length > 0) {
        this._traverseList(el.children, callback);
      }
    }
  }

  _isLeaf(el) {
    return el.tagName === 'LI' && el.querySelector('li') === null;
  }

  _getVisibleLis(parent) {
    return [...parent.querySelectorAll('li')].filter((li) => !this._isHidden(li));
  }

  _getRenderedLis(parent) {
    return [...parent.querySelectorAll('li')].filter((li) => {
      let current = li;
      while (current && current !== this._ul.parentElement) {
        if (this._isHidden(current)) return false;
        current = current.parentElement;
      }
      return true;
    });
  }

  _getSearchText(li) {
    if (this._settings.searchBy === 'value') {
      const val = li.dataset.value;
      if (val !== undefined && val.trim()) return val;
    }
    return this._getTextToNewLine(li);
  }

  _getTextToNewLine(el) {
    let text = el.textContent;
    const nlIndex = text.indexOf('\n');
    if (nlIndex >= 0) text = text.substring(0, nlIndex);

    const countSpan = el.querySelector(':scope > .count-li');
    if (countSpan) {
      const countText = countSpan.textContent;
      const idx = text.indexOf(countText);
      if (idx >= 0) text = text.substring(idx + countText.length);
    }
    return text;
  }
}

export default ListWithFilter;
