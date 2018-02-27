'use strict'
const BaseRole = require(`roles_base`)

class Harvester extends BaseRole {
  static role() {
    return 'harvester'
  }

  static orderParts(room, memory) {
    var extensions = room.extensions.length
    var numCouriers = room.creepsByRole('courier').length
    var numHarvesters = room.creepsByRole('harvester').length
    var container = !!memory.container
    var availableEnergy = room.energyAvailableForSpawning()

    // TOUGH          10
    // MOVE           50
    // CARRY          50
    // WORK           100

    switch(true) {
      case numCouriers === 0:
      case !container:
        return [WORK, CARRY, MOVE]

      case extensions == 0:
        return [WORK, WORK, MOVE]

      case numHarvesters === 0 && availableEnergy < 450:
      case extensions <= 2:
        return [WORK, WORK, WORK, MOVE]

      case numHarvesters === 0 && availableEnergy < 550:
      case extensions <= 4:
        return [WORK, WORK, WORK, WORK, MOVE]

      case numHarvesters === 0 && availableEnergy < 650:
      case extensions <= 6:
        return [WORK, WORK, WORK, WORK, WORK, MOVE]

      case numHarvesters === 0:
      default:
        return [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE]
    }
  }

  makeDecisions() {
    if(!this.creep.canCarry()) {
      return this.harvest(true)
    }

    if(this.creep.isEmpty()) {
      var numCouriers = this.room.creepsByRole('courier').length
      var overContainer = numCouriers > 0 && this.container !== null
      return this.harvest(overContainer)
    }

    if (this.refillSpawns() === false){
      this.upgrade()
    }
  }

  harvest(toContainer = false) {
    var container_id = this.container ? this.container.id : null
    this.program.launchChildProcess(`creep_harvest`, 'creep_tasks_farm', {
      cp:  this.creep.name,
      cn:  container_id,
      src: this.source.id,
      toC: toContainer
    })
    this.program.sleep(this.creep.ticksToLive)
  }

}

module.exports = Harvester
