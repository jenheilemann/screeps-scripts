'use strict'

/**
 * Tells Courier creeps what to do.
 */

class Courier extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.creep]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    var klass = require(`roles_courier`)
    var runner = new klass(this.creep, this.creep.room, this)

    runner.makeDecisions();
  }
}

module.exports = Courier
