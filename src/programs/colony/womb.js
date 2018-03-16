'use strict'

/**
 * Spawns new creeps when necessary.
 */

class Womb extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_SPAWNS
  }

  getDescriptor() {
    return this.data.room
  }

  main () {
    this.room = Game.rooms[this.data.room]
    if (!this.room) {
      this.suicide()
      return
    }

    if ( this.room.spawns.length == 0 ) {
      return this.suicide()
    }

    this.launchChildProcess(`census`, 'colony_census',
      { room: this.data.room })

    if ( this.room.spawns[0].spawning != null ) {
      return this.sleep(this.room.spawns[0].spawning.remainingTime )
    }

    if (!this.room.memory.nextCreep) {
      this.sleep(7)
      return
    }

    const Factory = require('managers_factory')
    var factory = new Factory(this.room, this.room.memory.nextCreep, this.room.spawns[0])
    if (factory.buildCreep()) {
      this.room.memory.nextCreep = false
    }
  }
}

module.exports = Womb
