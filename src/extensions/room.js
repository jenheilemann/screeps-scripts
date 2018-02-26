'use strict'

const Cache = require('lib_cache')
require('extensions_room_economy')
require('extensions_room_population')
require('extensions_room_structures')
require('extensions_room_territory')

Object.defineProperty(Room.prototype, 'cache', {
  get: function () {
    if (!this._cache) {
      this._cache = new Cache()
    }
    return this._cache
  }
})

Object.defineProperty(Room.prototype, 'defcon', {
  get: function () {
    if (!this._defcon) {
      const Calc = require('lib_defcon_calculator')
      this._defcon = new Calc(this).level()
    }
    return this._defcon
  },
  set: function(value) {
    return this._defcon = value
  }
})

Object.defineProperty(Room.prototype, 'safeModeActive', {
  get: function () {
    return this.cache.remember('safeModeActive', function(self) {
      return typeof(self.controller.safeMode) === 'number'
    }, [this])
  }
})
