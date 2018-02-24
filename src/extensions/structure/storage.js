'use strict'

StructureStorage.prototype.isFull = function () {
  return _.sum(this.store) == this.storeCapacity
}
