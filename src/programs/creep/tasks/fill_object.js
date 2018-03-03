'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class FillObject extends BaseTask {
  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    if (creep.isEmpty()) {
      this.wakeParent()
      this.suicide()
      return
    }

    var target = Game.getObjectById(this.data.to)

    if (!target || target.isFull()) {
      this.wakeParent()
      this.suicide()
      return
    }

    if (!creep.pos.isNearTo(target)) {
      this.launchChildProcess(`move_to_target`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   target.pos.toHash(),
        range: 1,
        style: 'courier'
      })
      var sleepFor = Math.ceil(creep.pos.findPathTo(target.pos).length/2)
      return this.sleep(sleepFor)
    }

    creep.transfer(target, this.data.resource)
  }
}


module.exports = FillObject
