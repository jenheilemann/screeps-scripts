'use strict'

StructureExtension.prototype.isFull = function () {
  return this.energy == this.energyCapacity
}

StructureExtension.prototype.needsEnergy = function() {
  return this.energy < this.energyCapacity
}

StructureExtension.prototype.isExtension = function() { return true }
