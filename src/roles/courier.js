'use strict'

class Courier extends GenericCreep {
  static role() {
    return 'courier'
  }

  static orderParts(roomManager, memory) {
    var extensions = Math.floor(roomManager.extensions().length/2)
    var spawns = roomManager.spawns().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    var totalCapacity = spawns*300 + extensions*50
    var numBlock = _.min([Math.floor(totalCapacity/150), 16])

    if (roomManager.creepsByRole()['courier'].length === 0) {
      // force two sets of parts because we can only be guaranteed 300 energy.
      numBlock = 2
    }

    var partsBlock = [CARRY, CARRY, MOVE]
    var parts = []
    for (var i = numBlock - 1; i >= 0; i--) {
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
      this.memory.addressee = null
      var dropped = _.first(this.roomManager.droppedEnergy())
      if (dropped && dropped.amount > this.container.store.energy) {
        return this.gatherDropped()
      }
      if (this.collectAny() !== false) {
        return
      }
      return this.gatherDropped()
    }

    if (this.refillSpawns() !== false){
      return
    }
    if (this.refillOpenContainers() !== false ) {
      return
    }
    if (this.refillTowers() !== false ) {
      return
    }

    this.moveOffRoad()
  }

}

module.exports = Courier
