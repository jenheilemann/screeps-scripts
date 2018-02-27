'use strict'

/**
 * Handles organizing each colony - an individual room that may harvest or
 * launch attacks to nearby rooms.
 */

class Colony extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_COLONY
  }

  getDescriptor() {
    return this.data.room
  }

  main () {
    this.room = Game.rooms[this.data.room]
    if (!this.room || !this.room.controller.my) {
      Room.removeColony(this.data.room)
      return this.suicide()
    }

    this.launchChildProcess(`mayor`, 'colony_mayor', { room: this.data.room })
    this.launchChildProcess(`sheriff`, 'colony_sheriff', { room: this.data.room })

    if (this.room.spawns.length > 0) {
      this.launchChildProcess(`womb`, 'colony_womb', { room: this.data.room })
    }
  }
}

module.exports = Colony
