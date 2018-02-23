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

Structure.prototype.exists = function() { return true }
Structure.prototype.needsEnergy = function() { return false }
Structure.prototype.isExtension = function() { return false }
Structure.prototype.isContainer = function() { return false }
Structure.prototype.isTower = function() { return false }
Structure.prototype.isRampart = function() {
  return this.structureType === STRUCTURE_RAMPART
}
Structure.prototype.isStorage = function() {
  return this.structureType === STRUCTURE_STORAGE
}
