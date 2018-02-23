'use strict'

class Harvester extends GenericCreep {
  static role() {
    return 'harvester'
  }

  static orderParts(roomManager, memory) {
    var extensions = roomManager.extensions().length
    var creeps = roomManager.creepsByRole()
    var container = !!memory.container
    var availableEnergy = roomManager.energyAvailableForSpawning()

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case creeps['courier'].length === 0:
      case !container:
        return [WORK, CARRY, MOVE]

      case extensions == 0:
        return [WORK, WORK, MOVE]

      case creeps['harvester'].length === 0 && availableEnergy < 450:
      case extensions <= 2:
        return [WORK, WORK, WORK, MOVE]

      case creeps['harvester'].length === 0 && availableEnergy < 550:
      case extensions <= 4:
        return [WORK, WORK, WORK, WORK, MOVE]

      case creeps['harvester'].length === 0 && availableEnergy < 650:
      case extensions <= 6:
        return [WORK, WORK, WORK, WORK, WORK, MOVE]

      case creeps['harvester'].length === 0:
      default:
        return [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    }
  }

  makeDecisions() {
    this.placeRoadConstructions()

    if (this.renewOrRecycle(this.roomManager.spawns()[0]) !== false) {
      return
    }

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
