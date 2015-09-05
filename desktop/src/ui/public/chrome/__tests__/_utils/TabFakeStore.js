let store = Symbol('store');

export default class TabFakeStore {
  constructor() { this[store] = new Map(); }
  getItem(k) { return this[store].get(k); }
  setItem(k, v) { return this[store].set(k, v); }
}
