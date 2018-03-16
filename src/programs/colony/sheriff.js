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

    const startCpu = Game.cpu.getUsed()
    let towers = room.towers
    for (let i in towers) {
      this.launchChildProcess(towers[i].id, `tower_commander`, {
        'tower': towers[i].id
      })
    }

    this.sleep(3)
  }
}

module.exports = Sheriff
