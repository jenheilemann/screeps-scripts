'use strict'

const Cache = require('lib_cache')

Object.defineProperty(Creep.prototype, 'cache', {
  get: function () {
    if (!this._cache) {
      this._cache = new Cache()
    }
    return this._cache
  }
})

Creep.prototype.numParts = function (partType) {
  return this.getActiveBodyparts(partType)
}

Creep.prototype.canCarry = function() {
  return this.numParts(CARRY) > 0
}

Creep.prototype.isFull = function () {
  return _.sum(this.carry) == this.carryCapacity
}

Creep.prototype.isEmpty = function (partType) {
  return _.sum(this.carry) == 0
}

Creep.prototype.ticksToFull = function() {
  return Math.ceil(this.trunkSpace/(this.numParts(WORK)*2))
}

Creep.prototype.ticksToEmpty = function() {
  return Math.ceil(this.carry.energy/(this.numParts(WORK)))
}

Object.defineProperties(Creep.prototype, {
  trunkSpace: {
    get: function () {
      return this.cache.remember('trunkSpace', function(self){
        return self.carryCapacity - _.sum(self.carry)
      }, [this])
    }
  },
})
