'use strict'
const BaseTask = require('programs_creep_tasks_base')

// Line styles for showing what action a creep is taking
const STYLE = {
  move:    {stroke: '#ffffff', strokeWidth: 0.1, opacity: 0.6},
  collect: {stroke: '#ff3366', strokeWidth: 0.1, opacity: 0.6},
  harvest: {stroke: '#ffbb33', strokeWidth: 0.1, opacity: 0.6},
  build:   {stroke: '#aaccff', strokeWidth: 0.1, opacity: 0.6},
  upgrade: {stroke: '#55ff55', strokeWidth: 0.1, opacity: 0.6},
  courier: {stroke: '#ffaaff', strokeWidth: 0.1, opacity: 0.6},
  repair:  {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  renew:   {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  recycle: {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  pickup:  {stroke: '#ffddbb', strokeWidth: 0.1, opacity: 0.6},
  run:     {stroke: '#ff0000', strokeWidth: 0.15, opacity: 0.7, lineStyle: 'dotted'},
}

/**
 * Move the creep to the chosen location
 */

class Move extends BaseTask {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_CREEP_MOVE
  }

  main () {
    var creep = Game.creeps[this.data.cp]

    if (!creep) {
      this.suicide()
      return
    }

    var pos = RoomPosition.fromHash(this.data.pos)
    var range = this.data.range ? this.data.range : 0
    if (creep.pos.inRangeTo(pos, range)) {
      this.suicide()
      return this.wakeParent()
    }

    if (creep.fatigue > 0) {
      return
    }

    this.data.c = this.data.b
    this.data.b = this.data.a
    this.data.a = creep.pos.toHash()
    let stuck = false,
        second = RoomPosition.fromHash(this.data.c),
        last = RoomPosition.fromHash(this.data.b)
    if (creep.pos.isEqualTo(second) && second.isEqualTo(last)) {
      console.log(creep, 'is stuck!')
      stuck = true
    }

    return creep.moveTo(pos, {
      visualizePathStyle: STYLE[this.data.style],
      reusePath: stuck ? 5 : 20,
      ignoreCreeps: !stuck,
      maxOps: 1000,
      maxRooms: 1,
      range: range
    })
  }
}

module.exports = Move
