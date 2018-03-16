'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Move the creep to the chosen location
 */

class Move extends BaseTask {
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

    this.pos = RoomPosition.fromHash(this.data.pos)
    this.range = this.data.range ? this.data.range : 0
    if (this.creep.pos.inRangeTo(this.pos, this.range)) {
      this.suicide()
      return this.wakeParent()
    }

    if (this.creep.fatigue > 0) {
      return
    }

    if (this.creep.room.name !== this.pos.roomName) {
      console.log('moving to new room', this.creep, this.pos.roomName)
      this.navToRoom()
      this.sleep(17)
      return
    }

    this.killChild('move_to_room')
    this.navInRoom()
  }

  navInRoom() {
    this.data.c = this.data.b
    this.data.b = this.data.a
    this.data.a = this.creep.pos.toHash()
    let stuck = false,
        second = RoomPosition.fromHash(this.data.c),
        last = RoomPosition.fromHash(this.data.b)
    if (this.creep.pos.isEqualTo(second) && second.isEqualTo(last)) {
      console.log(this.creep, 'is stuck!')
      stuck = true
      delete this.creep.memory._path
    }
    let maxRooms = this.data.maxRooms ? this.data.maxRooms : 1

    let result = this.creep.moveTo(this.pos, {
      visualizePathStyle: CREEP_MOVE_STYLE[this.data.style],
      reusePath: stuck ? 5 : 20,
      ignoreCreeps: !stuck,
      maxOps: 1000,
      maxRooms: maxRooms,
      range: this.range
    })

    if (result === ERR_NO_PATH) {
      // TODO: something?
    }
  }

  navToRoom() {
    this.launchChildProcess(`move_to_room`, 'creep_tasks_move_room', {
      cp:   this.data.cp,
      room: this.pos.roomName
    })
  }
}

module.exports = Move
