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

    if (creep.numParts(CARRY) > 0 && creep.isFull()) {
      this.wakeParent()
      this.suicide()
      return
    }

    var source = Game.getObjectById(this.data.src)

    if (!creep.pos.isNearTo(source.pos)) {
      this.launchChildProcess(`move_to_source`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   source.pos.toHash(),
        range: 1,
        style: 'harvest'
      })
      var sleepFor = Math.floor(creep.pos.findPathTo(source.pos).length*1.5)
      return this.sleep(sleepFor)
    }

    creep.harvest(source)
  }
}

module.exports = Harvest
