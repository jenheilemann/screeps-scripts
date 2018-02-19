'use strict'

Structure.prototype.repairNeeded = function (percent) {
  return this.hits/this.hitsMax < percent
}

Structure.prototype.isBarrier = function () {
  return STRUCTURE_BARRIER.includes(this.structureType)
}

Structure.prototype.isNull = function() {
  return false
}
