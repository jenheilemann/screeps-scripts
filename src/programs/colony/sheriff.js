'use strict'

/**
 * Polices the borders and ensures that our civilians are safe.
 */

class Sheriff extends kernel.process {
  getDescriptor() {
    return this.data.room
  }

  main () {
    let room = Game.rooms[this.data.room]
    if (!room) {
      this.suicide()
      return
    }

    this.launchChildProcess('towers', `tower_commander`, {room: this.data.room})

    this.sleep(3)
  }
}

module.exports = Sheriff
