'use strict'

/**
 * Organizes the creep workforce within the colony.
 */

class Mayor extends kernel.process {
  constructor (...args) {
    super(...args)
  }

  getDescriptor() {
    return this.data.room
  }

  main () {
    var room = Game.rooms[this.data.room]
    if (!room) {
      this.suicide()
      return
    }

    var creeps = room.colonyCreeps
    for (var cname in creeps) {
      this.launchChildProcess(`creep_${cname}`, 'creep', {
        'creep': cname
      })
    }
  }
}

module.exports = Mayor
