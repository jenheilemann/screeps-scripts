'use strict'

Creep.prototype.numParts = function (partType) {
  return _.sum(this.body, (part) => part.type === partType)
}

Creep.prototype.isFull = function (partType) {
  return _.sum(this.carry) == this.carryCapacity
}
