'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Sends a creep to upgrade the controller
 */

class Upgrade extends BaseTask {
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

    var controller = Game.getObjectById(this.data.id)

    if (!controller) {
      // how on earth did we get here???
      this.wakeParent()
      this.suicide()
      return
    }

    var result = creep.upgradeController(controller)

    if (result === ERR_NOT_IN_RANGE) {
      this.launchChildProcess(`move_to_controller`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   controller.pos.toHash(),
        range: 2,
        style: 'upgrade'
      })
      var sleepFor = Math.floor(creep.pos.findPathTo(controller.pos).length*1.5)
      return this.sleep(sleepFor)
    }

    if (result !== OK) {
      Logger.error(`${this.data.cp}, Attempting to upgrade controller, but Error Code: ${result}`)
    }
  }
}


module.exports = Upgrade
