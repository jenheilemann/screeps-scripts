'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Move the creep to the chosen location
 */

class Flee extends BaseTask {
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

    this.room = Game.rooms[this.data.room]
    if (this.room.defcon.level === 0) {
      this.killChild('run_away')
      this.goHome()
      return this.sleep(7)
    }

    this.killChild('go_home')
    this.goAway()
    this.sleep(7)
  }

  goHome() {
    if (this.creep.room.name === this.room.name) {
      this.suicide()
      this.wakeParent()
      return
    }
    let pos = new RoomPosition(25, 25, this.data.room).toHash()
    this.launchChildProcess(`go_home`, 'creep_tasks_move', {
      cp:    this.data.cp,
      range: 24,
      pos:   pos
    })
  }

  goAway() {
    if (this.creep.room.name !== this.room.name) {
      // wait until it's safe to return
      this.creep.say('shhh...', true)
      return
    }
    let goal = this.room.safeNeighbors[0]
    let pos = new RoomPosition(25, 25, goal.roomName).toHash()
    this.launchChildProcess(`run_away`, 'creep_tasks_move', {
      cp:    this.data.cp,
      range: 23,
      pos:   pos,
      style: 'run'
    })
    this.creep.say('AHHH!', true)

  }
}

module.exports = Flee
