'use strict'

ConstructionSite.prototype.isBarrier = function () {
  return STRUCTURE_BARRIER.includes(this.structureType)
}
