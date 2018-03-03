
'use strict'

/**
 * Repair structures in the tower's room
 */

class Repair extends kernel.process {

  main () {
    this.tower = Game.getObjectById(this.data.tower)
    if (!this.tower) {
      this.wakeParent()
      return this.suicide()
    }

    if (this.tower.energy/this.tower.energyCapacity < 0.25) {
      // save for emergencies
      return
    }

    var repairable = Game.getObjectById(this.data.repair)
    // something got destroyed, probably
    if (!repairable) {
      this.wakeParent()
      return this.suicide()
    }

    // it doesn't need repairing any more
    if (repairable.hits/repairable.hitsMax > 0.98 ) {
      this.wakeParent()
      return this.suicide()
    }

    this.tower.repair(repairable)
  }
}

module.exports = Repair
