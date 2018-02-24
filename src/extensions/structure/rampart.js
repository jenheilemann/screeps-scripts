'use strict'

StructureRampart.prototype.repairNeeded = function (percent, max = this.hitsMax) {
  max = max > this.hitsMax ? this.hitsMax : max
  return this.hits/max < percent
}
