'use strict'

StructureContainer.prototype.isFull = function () {
  return _.sum(this.store) == this.storeCapacity
}

