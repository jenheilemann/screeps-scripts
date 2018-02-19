'use strict'

// The fixer. Repairbot. Mr. Handy. The Clamps.
// Makes sure the roads don't rot away.

class HandyBot extends GenericCreep{
  static role() {
    return 'handybot'
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case extensions == 0:
        return [WORK, CARRY, MOVE]
        break;
      case extensions <= 5:
        return [WORK, WORK, CARRY, MOVE, MOVE]
        break;
      case extensions <= 10:
        return [WORK, WORK, WORK, CARRY, MOVE, MOVE]
        break;
      case extensions <= 20:
        return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
        break;
      default:
        return [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE]
    }
  }

  makeDecisions() {
    if(this.creep.carry.energy == 0) {
      this.memory.repairing = false;
    }
    if(!this.memory.repairing && this.creep.carry.energy == this.creep.carryCapacity) {
      this.memory.repairing = true;
    }

    if(this.memory.repairing) {
      if (this.repair() === false) {
        this.moveOffRoad()
      }
      return
    }

    if (this.collect() === false){
      this.harvest()
    }
  }

}

module.exports = HandyBot
