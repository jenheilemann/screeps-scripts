'use strict'

/**
 * Tells Builder creeps what to do.
 */

class Builder extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.creep]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    var klass = require(`roles_builder`)
    var runner = new klass(this.creep, this.creep.room, this)

    runner.makeDecisions();
  }
}

module.exports = Builder
