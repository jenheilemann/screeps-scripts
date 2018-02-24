'use strict'

StructureTower.prototype.isFull = function () {
  return this.energy === this.energyCapacity
}

StructureTower.prototype.needsEnergy = function() {
  return this.energy < this.energyCapacity
}
StructureTower.prototype.isTower = function() { return true }
