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

    switch(true) {
      case extensions == 0:
        return [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE]
        break;
      case extensions <= 5:
        return [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE]
        break;
      case extensions <= 10:
        return [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE]
        break;
      case extensions <= 20:
        return [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE]
        break;
      default:
        return [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE]
    }
  }

  makeDecisions() {
    if(this.creep.carry.energy < this.creep.carryCapacity) {
      return this.collect()
    }
    if (this.courier() === false){
      this.moveOffRoad()
    }
  }

}

module.exports = Courier