'use strict'

class Upgrader extends GenericCreep {
  static role() {
    return 'upgrader'
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case extensions == 0:
        return [WORK, CARRY, MOVE, MOVE]
        break;
      case extensions <= 5:
        return [WORK, WORK, CARRY, MOVE, MOVE]
        break;
      case extensions <= 10:
        return [WORK, WORK, WORK, CARRY, MOVE, MOVE]
        break;
      case extensions <= 20:
        return [WORK, WORK, WORK, CARRY, MOVE, CARRY, MOVE, MOVE]
        break;
      default:
        return [WORK, WORK, WORK, WORK, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE]
    }
  }

  makeDecisions() {
    if(this.memory.upgrading && this.creep.carry.energy == 0) {
      this.memory.upgrading = false;
    }
    if(!this.memory.upgrading && this.creep.carry.energy == this.creep.carryCapacity) {
      this.memory.upgrading = true;
    }

    this.placeRoadConstructions();
    if(this.memory.upgrading) {
      return this.upgrade()
    }
    if (this.collect() === false) {
      this.harvest()
    }
  }

}

module.exports = Upgrader
