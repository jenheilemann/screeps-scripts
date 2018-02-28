'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Sends a creep to a source and harvests it.
 */

class Farm extends BaseTask {
  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    var container = Game.getObjectById(this.data.cn)
    var toContainer = this.data.toC
    var pos = creep.pos

    if (container && !pos.isEqualTo(container)) {
      this.launchChildProcess(`move_to_container`, 'creep_tasks_move', {
        cp:  this.data.cp,
        pos: container.pos.toHash(),
        style: 'harvest'
      })
      var sleepFor = Math.floor(pos.findPathTo(container.pos).length*1.5)
      return this.sleep(sleepFor)
    }

    var source = Game.getObjectById(this.data.src)

    if (creep.carryCapacity == 0 || !creep.isFull() ){
      this.launchChildProcess(`harvest_energy`, 'creep_tasks_harvest', {
        cp:  this.data.cp,
        src: source.id,
      })
      var sleepFor = creep.carryCapacity == 0 ? creep.ticksToLive : creep.ticksToFull
      return this.sleep(sleepFor)
    }

    if (toContainer && container && !container.isFull() && pos.isEqualTo(container) ) {
      creep.drop(RESOURCE_ENERGY)
      return
    }

    if (creep.isFull()) {
      this.wakeParent()
      this.suicide()
    }
  }
}

module.exports = Farm
