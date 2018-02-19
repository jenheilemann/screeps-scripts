'use strict'

Structure.prototype.repairNeeded = function () {
  return this.hits/this.hitsMax < 0.8
}

Structure.prototype.isBarrier = function () {
  return STRUCTURE_BARRIER.includes(this.structureType)
}

Structure.prototype.isNull = function() {
  return false
}
