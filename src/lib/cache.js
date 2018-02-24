'use strict'

class Cache {
  constructor() {
    this._cacheMap = {};
  }

  get(key) {
    return this._cacheMap[key];
  }

  set(key, value) {
    this._cacheMap[key] = value;
    return this._cacheMap[key];
  }

  remember(key, callback, args) {
    args = args || [];
    if(typeof(this.get(key)) === 'undefined' ) {
      var result = callback.apply(null, args);
      this.set(key, result)
    }

    return this._cacheMap[key];
  }
}

module.exports = Cache;
