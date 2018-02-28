'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class FillCreep extends BaseTask {
  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    if (creep.isFull()) {
      this.wakeParent()
      this.suicide()
      return
    }

    var container = Game.getObjectById(this.data.from)
    var resource = this.data.resource

    if (!container || container.store[resource] === 0 ) {
      this.wakeParent()
      this.suicide()
      return
    }

    if (!creep.pos.isNearTo(container)) {
      this.launchChildProcess(`move_to_container`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   container.pos.toHash(),
        range: 1,
        style: 'courier'
      })
      // short sleep since the container can empty enroute
      return this.sleep(10)
    }

    creep.withdraw(container, resource)
  }
}


module.exports = FillCreep
