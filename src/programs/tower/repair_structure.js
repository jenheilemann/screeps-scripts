
'use strict'

/**
 * Repair structures in the tower's room
 */

class RepairStructure extends kernel.process {
  main () {
    this.tower = Game.getObjectById(this.data.tower)
    if (!this.tower) {
      return this.suicide()
    }

    if (this.tower.energy/this.tower.energyCapacity < 0.25) {
      // save for emergencies
      return
    }

    var repairable = Game.getObjectById(this.data.repair)
    // something got destroyed, probably
    if (!repairable) {
      return this.suicide()
    }

    // it doesn't need repairing any more
    if (repairable.hits/repairable.hitsMax > 0.98 ) {
      return this.suicide()
    }

    this.tower.repair(repairable)
  }
}

module.exports = RepairStructure
