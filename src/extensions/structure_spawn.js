'use strict'

StructureSpawn.prototype.isFull = function () {
  return this.energy == this.energyCapacity
}

StructureSpawn.prototype.needsEnergy = function() {
  return this.energy < this.energyCapacity
}
