'use strict'

StructureWall.prototype.repairNeeded = function (percent, max = this.hitsMax) {
  return this.hits/max < percent
}
