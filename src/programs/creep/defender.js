'use strict'

/**
 * Tells Defender creeps what to do.
 */

class Defender extends kernel.process {
  getDescriptor() {
    return this.data.creep
  }

  main () {
    this.creep = Game.creeps[this.data.creep]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }

    var klass = require(`roles_defender`)
    var runner = new klass(this.creep, this.creep.room, this)

    runner.makeDecisions();
  }
}

module.exports = Defender
