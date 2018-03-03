'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Pickup extends BaseTask {
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

    var resource = Game.getObjectById(this.data.target)

    if (!resource) {
      this.wakeParent()
      this.suicide()
      return
    }

    if (!creep.pos.isNearTo(resource)) {
      this.launchChildProcess(`move_to_resource`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   resource.pos.toHash(),
        range: 1,
        style: 'pickup'
      })
      // short sleep since the resource can disappear enroute
      return this.sleep(10)
    }

    creep.pickup(resource)
  }
}


module.exports = Pickup
