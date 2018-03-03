
'use strict'

/**
 * Heal creeps
 */

class Heal extends kernel.process {

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

    var hurt = Game.getObjectById(this.data.hurt)
    // looks like the creep died :(
    // ORRRRR it's in a different room :D
    if (!hurt || hurt.pos.roomname !== this.tower.pos.roomname) {
      this.wakeParent()
      return this.suicide()
    }

    // it doesn't need healing any more
    if (hurt.hits === hurt.hitsMax ) {
      this.wakeParent()
      return this.suicide()
    }

    this.tower.heal(hurt)
  }
}

module.exports = Heal
