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
    for (var cname in this.creeps) {
      this.launchChildProcess(`creep_${cname}`, 'creep', {
        'creep': cname
      })
    }
  }
}

module.exports = Mayor
