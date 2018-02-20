'use strict'

class Courier extends GenericCreep {
  static role() {
    return 'courier'
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    var totalCapacity = 300 + extensions * 50
    var count = Math.floor(totalCapacity/150)

    if (roomManager.creepsByRole()['courier'].length === 0) {
      // force two sets of parts because we can only be guaranteed 300 energy.
      count = 2
    }

    var partsBlock = [CARRY, CARRY, MOVE]
    var parts = []
    for (var i = count - 1; i >= 0; i--) {
      parts = parts.concat(partsBlock)
    }

    return parts
  }

  makeDecisions() {
    if (this.creep.carry.energy == 0) {
      this.memory.collect = true
    }
    if (this.memory.collect && this.creep.carry.energy == this.creep.carryCapacity){
      this.memory.collect = false
    }

    if(this.memory.collect) {
      this.memory.parking = false
      return this.collect()
    }

    if (this.courier() === false){
      this.moveOffRoad()
    }
  }

}

module.exports = Courier
