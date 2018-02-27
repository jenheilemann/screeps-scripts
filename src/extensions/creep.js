'use strict'

Creep.prototype.numParts = function (partType) {
  return _.sum(this.body, (part) => part.type === partType)
}

Creep.prototype.canCarry = function() {
  return this.numParts(CARRY) > 0
}

Creep.prototype.isFull = function (partType) {
  return _.sum(this.carry) == this.carryCapacity
}

Creep.prototype.isEmpty = function (partType) {
  return _.sum(this.carry) == 0
}

Creep.prototype.ticksToFull = function() {
  return Math.ceil(this.trunkSpace()/(this.numParts(WORK)*2))
}

Creep.prototype.ticksToEmpty = function() {
  return Math.ceil(this.carry.energy/(this.numParts(WORK)))
}

Creep.prototype.trunkSpace = function() {
  return this.carryCapacity - _.sum(this.carry)
}
