'use strict'

/**
 * Tells Defender creeps what to do.
 */

class Defender extends kernel.process {
  getDescriptor() {
    return this.data.creep
  }

  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }
  }
}

module.exports = Defender
