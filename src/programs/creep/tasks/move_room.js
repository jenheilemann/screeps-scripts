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
    Logger.trace(`moving to room ${this.data.room} ${this.creep}`)

    if (this.creep.room.name === this.data.room) {
      Logger.trace(`creep has arrived ${this.data.room} ${this.creep}`)
      this.suicide()
      this.wake()
      return this.wakeParent()
    }

    if (!this.data.path) {
      this.data.path = this.planPath()
    }

    if (this.creep.room.name === this.data.path[0].room) {
      Logger.trace(`arrived at next room ${this.data.room} ${this.creep}`)
      this.data.path.shift()
      delete this.data.exit
      this.killChild('move_through_room')
    }

    this.moveThroughRoom()
  }

  planPath() {
    Logger.trace(`planning path ${this.creep} ${this.creep.room.name} ${this.data.room}`)
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
    Logger.trace(`exit found ${exit}`)

    if (this.creep.pos.isEqualTo(exit)) {
      Logger.trace(`${this.creep} waiting to switch rooms`)
      // wait a tick to go to the next room
      this.killChild('move_through_room')
      return
    }

    this.launchChildProcess('move_through_room', 'creep_tasks_move', {
      cp:          this.data.cp,
      pos:         this.data.exit,
      range:       0,
      maxRooms:    1,
      style:       this.data.style,
      ignoreRoads: this.data.ignoreRoads
    })
  }

  findExit() {
    if (this.data.exit) {
      Logger.trace(`exit from memory ${JSON.stringify(this.data.exit)}`)
      return RoomPosition.fromHash(this.data.exit)
    }

    let exit = this.creep.pos.findClosestByPath(this.data.path[0].exit, {
      ignoreCreeps: true,
      maxOps: 1000,
      maxRooms: 1
    })
    Logger.trace(`calculated new exit ${exit}`)
    if (exit === null) {
      Logger.trace(`${this.creep} could not find path!` +
        ' from:' + this.creep.room,
        ' to:' + this.data.path[0].room,
        ' exit: ' + this.data.path[0].exit)
      if (!this.data.unpathable) {
        this.data.unpathable = []
      }
      this.data.unpathable.push(this.data.path[0].room)
      this.data.path = this.planPath()
      return // wait a tick to pop into the last room
    }
    this.data.exit = exit.toHash()
    return exit
  }
}

module.exports = MoveRoom
