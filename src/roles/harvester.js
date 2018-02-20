'use strict'

class Harvester extends GenericCreep {
  static role() {
    return 'harvester'
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length
    var creeps = roomManager.creepsByRole()
    var container = !!memory.container

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case creeps['courier'].length == 0:
      case !container:
        return [WORK, WORK, CARRY, MOVE]
        break;
      case extensions == 0:
        return [WORK, WORK, MOVE]
        break;
      case extensions <= 5:
      case creeps['harvester'].length < 1:
        return [WORK, WORK, WORK, MOVE]
        break;
      case extensions <= 10:
        return [WORK, WORK, WORK, WORK, MOVE]
        break;
      case extensions <= 20:
        return [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE]
        break;
      default:
        return [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    }
  }

  makeDecisions() {
    this.placeRoadConstructions()
    if(this.creep.carryCapacity == 0) {
      return this.harvest(true)
    }

    if (this.creep.memory.harvesting && this.creep.carry.energy == this.creep.carryCapacity ) {
      this.creep.memory.harvesting = false
    }
    if(!this.creep.memory.harvesting && this.creep.carry.energy == 0 ) {
      this.creep.memory.harvesting = true
    }

    if(this.creep.memory.harvesting) {
      var creeps = this.roomManager.creepsByRole()
      var overContainer = creeps['courier'].length > 0
      return this.harvest(overContainer)
    }

    if (this.refillSpawns() === false) {
      this.upgrade()
    }
  }
}

module.exports = Harvester
