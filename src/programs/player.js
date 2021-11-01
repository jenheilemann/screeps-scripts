'use strict'

/**
 * Top level program- it is responsible for launching everything else.
 */

class Player extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_PLAYER
  }

  main () {
    // Organize colonies
    const colonies = Room.getColonies()
    let roomname, room
    for (roomname of colonies) {
      /**
       * Launch a "Colony" program for each room saved in memory.
       * `Room.addCity` to add new rooms.
       */
      room = Game.rooms[roomname]

      if (room && room.controller && room.controller.my) {
        this.launchChildProcess(`room_${roomname}`, 'colony', {
          'room': roomname
        })
      }
    }

    // Monitor behavior of programs
    for (let priority of MONITOR_PRIORITIES) {
      this.launchChildProcess(`pmonitor_${priority}`, 'meta_monitor', {
        'priority': priority
      })
    }
  }
}

module.exports = Player
