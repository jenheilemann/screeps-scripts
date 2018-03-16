'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * The creep tries to hide in an empty rampart, if none available then it runs
 * away from any enemies.
 */

class Hunker extends BaseTask {
  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    this.room = Game.rooms[this.creep.memory.colony]
    if (this.room.defcon.level === 0) {
      delete this.creep.memory.hiding
      this.wakeParent()
      this.suicide()
      return
    }

    let rampart = Game.getObjectById(this.data.rampart)
    if (!rampart || this.rampartIsOccupied(rampart)) {
      console.log('finding rampart')
      let ramparts = _.filter(this.room.hidingSpots,
        (r) => this.room.lookForAt(LOOK_CREEPS, r).length === 0)

      if (ramparts.length === 0) {
        // this.launchChildProcess(`run_away`, 'creep_tasks_flee', {
        //   cp:    this.data.cp,
        // })
        console.log('run away!')
        this.creep.say('AHHH!', true)
        return
      }
      rampart = this.creep.pos.findClosestByPath(ramparts)
      this.data.rampart = rampart.id
      console.log('rampart chosen', rampart.id)
    }

    // this.killChild('run_away')
    if (!this.creep.pos.isEqualTo(rampart)) {
      this.launchChildProcess(`move_to_rampart`, 'creep_tasks_move', {
        cp:    this.data.cp,
        pos:   rampart.pos.toHash(),
        range: 0,
        style: 'run'
      })
      console.log('moving to rampart')
      return
    }

    if (this.creep.memory.hiding === true) {
      console.log('hiding!')
      this.creep.say(`Shhhhh`)
      return this.sleep(5)
    }

    this.creep.memory.hiding = true
    return this.sleep(5)
  }

  rampartIsOccupied(rampart) {
    let creeps = this.room.lookForAt(LOOK_CREEPS, rampart)
    if (creeps.length == 0) {
      console.log('no creeps on rampart')
      return false
    }
    if (creeps[0].name == this.creep.name) {
      console.log('I am on the rampart!')
      return false
    }
    console.log('Somebody else is on the rampart', creeps[0].name)
    return true
  }
}


module.exports = Hunker
