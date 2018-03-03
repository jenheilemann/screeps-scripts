'use strict'
const BaseTask = require('programs_creep_tasks_base')

/**
 * Organizes the creep workforce within the colony.
 */

class Park extends BaseTask {
  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.wakeParent()
      this.suicide()
      return
    }

    var pos = this.creep.pos
    var current = this.creep.room.lookAt(pos)
    if (this._locationIsParkingAppropriate(current)) {
      this.creep.memory.parking = true
      this.creep.say(`🚬`)
      this.wakeParent()
      this.suicide()
      return pos;
    }

    var parkingSpot = this._findParkingSpot(pos)
    if (typeof(parkingSpot) == 'object' ) {
      this.creep.moveTo(parkingSpot)
    } else {
      this.creep.memory.parking = false
      this.creep.move(_.shuffle([LEFT, TOP_LEFT, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT])[0])
    }
    return this.creep.say('???')
  }

  _findParkingSpot(pos) {
    var area = this.creep.room.lookAtArea(pos.y-1,pos.x-1,pos.y+1,pos.x+1);
    for (var y in area) {
      for (var x in area[y]) {
        if (this._locationIsParkingAppropriate(area[y][x]) === true) {
          return new RoomPosition(x,y,this.creep.room.name)
        }
      }
    }
    return false
  }

  _locationIsParkingAppropriate(data) {
    for (var i in data) {
      if (data[i].type === 'creep' && data[i].creep.id !== this.creep.id) {
        return false
      }
      if (data[i].type === 'structure' && data[i].structure.structureType !== STRUCTURE_RAMPART) {
        return false
      }
      if (data[i].type === 'terrain' && data[i].terrain === 'wall'){
        return false
      }
    }
    return true
  }
}


module.exports = Park
