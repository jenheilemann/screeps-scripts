'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Repair extends BaseTask {
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

    var target = Game.getObjectById(this.data.target)

    if (!target) {
      this.wakeParent()
      this.suicide()
      return
    }

    if (!creep.pos.inRangeTo(target, 3)) {
      this.launchChildProcess(`move_to_target`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   target.pos.toHash(),
        range: 3,
        style: 'repair'
      })
      var sleepFor = Math.floor(creep.pos.findPathTo(target.pos).length*1.5)
      return this.sleep(sleepFor)
    }

    creep.repair(target)
  }
}


module.exports = Build
