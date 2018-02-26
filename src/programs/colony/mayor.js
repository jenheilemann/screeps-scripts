'use strict'

/**
 * Organizes the creep workforce within the colony.
 */

class Mayor extends kernel.process {
  constructor (...args) {
    super(...args)
    this.room = Game.rooms[this.data.room]
    this.creeps = this.room.colonyCreeps
  }

  getDescriptor() {
    return this.data.room
  }

  main () {
    console.log('mayor creeps', _.map(this.creeps, 'id') )
  }
}

module.exports = Mayor
