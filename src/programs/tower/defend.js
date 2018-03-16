
'use strict'

/**
 * Runs the towers that protect and repair the room.
 */

class Defend extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_DEFENSE
  }

  main () {
    this.tower = Game.getObjectById(this.data.tower)
    if (!this.tower) {
      this.wakeParent()
      return this.suicide()
    }

    var enemy = Game.getObjectById(this.data.enemy)
    if (!enemy) {
      this.wakeParent()
      return this.suicide()
    }

    if (enemy.pos.onEdge) {
      // don't drain
      console.log('enemy on edge', enemy.pos)
      this.wakeParent()
      this.suicide()
      return
    }

    if (this.tower.pos.getRangeTo(enemy) > TOWER_FALLOFF_RANGE) {
      this.wakeParent()
      return this.suicide()
    }

    this.tower.attack(enemy)
  }
}

module.exports = Defend
