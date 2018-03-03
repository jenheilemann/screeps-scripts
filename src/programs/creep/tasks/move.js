'use strict'
const BaseTask = require('programs_creep_tasks_base')

// Line styles for showing what action a creep is taking
const STYLE = {
  move:    {stroke: '#ffffff', width: 0.1, opacity: 0.6},
  collect: {stroke: '#ff33ff', width: 0.1, opacity: 0.6},
  harvest: {stroke: '#ffbb33', width: 0.1, opacity: 0.6},
  build:   {stroke: '#aaccff', width: 0.1, opacity: 0.6},
  upgrade: {stroke: '#55ff55', width: 0.1, opacity: 0.6},
  courier: {stroke: '#ffaaff', width: 0.1, opacity: 0.6},
  repair:  {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
  renew:   {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
  recycle: {stroke: '#aaaaff', width: 0.1, opacity: 0.6},
  pickup:  {stroke: '#ffddbb', width: 0.1, opacity: 0.6},
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

    var pos = new RoomPosition(this.data.pos.x, this.data.pos.y, this.data.pos.r)
    var range = this.data.range ? this.data.range : 0

    console.log("creep", this.data.cp, "pos", creep.pos, "goal", pos)
    if (creep.pos.inRangeTo(pos, range)) {
      this.suicide()
      return this.wakeParent()
    }

    return creep.moveTo(pos, { visualizePathStyle: STYLE[this.data.style]})
  }
}

module.exports = Move
