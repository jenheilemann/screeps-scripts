'use strict'

class Worker extends GenericCreep {
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
      case extensions == 1:
        return [WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions == 2:
        return [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions <= 5:
        return [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]
        break;
      case extensions <= 10:
        return [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
        break;
      case extensions <= 20:
        return [
          WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE]
        break;
      default:
        return [
          WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
    }
  }
}

module.exports = Worker
