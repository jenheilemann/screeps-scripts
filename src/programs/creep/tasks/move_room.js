'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Move the creep to the chosen location
 */

class MoveRoom extends BaseTask {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_CREEP_MOVE
  }

  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }
    console.log('moving to room', this.data.room, this.creep)

    if (this.creep.room.name === this.data.room) {
      console.log('creep has arrived', this.data.room, this.creep)
      this.suicide()
      this.wake()
      return this.wakeParent()
    }

    if (!this.data.path) {
      this.data.path = this.planPath()
    }

    if (this.creep.room.name === this.data.path[0].room) {
      console.log('arrived at next room')
      this.data.path.shift()
      delete this.data.exit
      this.killChild('move_through_room')
    }

    this.moveThroughRoom()
  }

  planPath() {
    console.log('planning path', this.creep, this.creep.room.name, this.data.room)
    return Game.map.findRoute(this.creep.room, this.data.room, {
      routeCallback: function(roomName, from) {
        if(this.data.unpathable && this.data.unpathable.includes(roomName)) {
          return Infinity
        }
        return 1
      }.bind(this)
    })
  }

  moveThroughRoom() {
    let exit = this.findExit()
      console.log('exit found', exit)

    if (this.creep.pos.isEqualTo(exit)) {
      console.log(this.creep, 'waiting to switch rooms')
      // wait a tick to go to the next room
      this.killChild('move_through_room')
      return
    }

    console.log(this.creep, 'moving to', exit)

    this.launchChildProcess('move_through_room', 'creep_tasks_move', {
      cp:       this.data.cp,
      pos:      this.data.exit,
      range:    0,
      maxRooms: 1
    })
  }

  findExit() {
    if (this.data.exit) {
      console.log('exit from memory', JSON.stringify(this.data.exit))
      return RoomPosition.fromHash(this.data.exit)
    }

    let exit = this.creep.pos.findClosestByPath(this.data.path[0].exit, {
      ignoreCreeps: true,
      maxOps: 1000,
      maxRooms: 1
    })
    console.log('calculated new exit', exit)
    if (exit === null) {
      console.log(this.creep, 'could not find path!',
        ' from:', this.creep.room,
        ' to:', this.data.path[0].room,
        ' exit: ', this.data.path[0].exit)
      if (!this.data.unpathable) {
        this.data.unpathable = []
      }
      this.data.unpathable.push(this.creep.room.name)
      this.data.path = this.planPath()
      return // wait a tick to pop into the last room
    }
    this.data.exit = exit.toHash()
    return exit
  }
}

module.exports = MoveRoom
