'use strict'

StructureContainer.prototype.isFull = function () {
  return _.sum(this.store) == this.storeCapacity
}
StructureContainer.prototype.isContainer = function() { return true }
