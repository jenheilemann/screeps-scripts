'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Harvest extends BaseTask {
  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }
    Logger.debug(`Harvesting: ${creep.name}`)

    if (creep.numParts(CARRY) > 0 && creep.isFull()) {
      this.wakeParent()
      this.suicide()
      return
    }

    var source = Game.getObjectById(this.data.src)

    if (!creep.pos.isNearTo(source.pos)) {
      this.wakeParent()
      this.suicide()
      return
    }
    creep.harvest(source)
  }
}

module.exports = Harvest
