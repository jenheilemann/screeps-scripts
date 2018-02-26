'use strict'

/**
 * Organizes the creep workforce within the colony.
 */

class Creep extends kernel.process {
  getDescriptor() {
    return this.data.creep
  }

  main () {
    this.creep = Game.creeps[this.data.creep]

    if (!this.creep) {
      this.suicide()
      return
    }

    var role = this.creep.memory.role
    var klass = require(`roles_${role}`)
    var runner = new klass(this.creep, this.creep.room)

    runner.makeDecisions();
  }
}

module.exports = Creep
