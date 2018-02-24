'use strict'

class Defender {
  constructor(creep, roomManager) {
    this.creep = creep
    this.roomManager = roomManager
  }

  static initializeMemory(roomManager) {
    return { role: 'defender' }
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // ATTACK         80
    // WORK           100
    // RANGED_ATTACK  150
    // HEAL           200

    switch(true) {
      case extensions <= 5:
        return [TOUGH, MOVE, MOVE, RANGED_ATTACK]
        break;
      case extensions <= 10:
        return [TOUGH, TOUGH,
          MOVE, MOVE, MOVE, MOVE,
          RANGED_ATTACK, RANGED_ATTACK]
        break;
      case extensions <= 20:
        return [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
        break;
      default:
        return [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
          RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]
    }
  }

  makeDecisions() {
  }

}

module.exports = Defender
