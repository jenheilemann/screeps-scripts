'use strict'

Structure.prototype.repairNeeded = function () {
  return this.hits/this.hitsMax < 0.8
}

Structure.prototype.isBarrier = function () {
  return this.structureType == STRUCTURE_WALL || this.structureType == STRUCTURE_RAMPART
}
