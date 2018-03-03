'use strict'

/**
 * Polices the borders and ensures that our civilians are safe.
 */

class Sheriff extends kernel.process {
  getDescriptor() {
    return this.data.room
  }

  main () {
    var room = Game.rooms[this.data.room]
    if (!room) {
      this.suicide()
      return
    }

    var towers = room.towers
    for (var i in towers) {
      this.launchChildProcess(towers[i].id, `tower_commander`, {
        'tower': towers[i].id
      })
    }
  }
}

module.exports = Sheriff
