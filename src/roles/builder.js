'use strict'
const WorkerCreep = require(`roles_worker`)

class Builder extends WorkerCreep {
  static role() {
    return 'builder'
  }

  static goalPopulation(room) {
    if (room.defcon.level > 0) {
      return 0
    }
    var sites = room.constructionSites

    if (sites.length == 0) {
      return this.repairGoalPopulation(room)
    }
    var progress = _.sum(_.map(sites, 'progress'))
    var total = _.sum(_.map(sites, 'progressTotal'))
    var remaining = total - progress

    if (remaining <= 15000) {
      return 1
    }
    return 2
  }

  static repairGoalPopulation(room) {
    var towers = room.towers.length
    if (towers > 0) {
      return 0
    }

    // includes roads!
    var structures = room.repairNeededStructures().length +
                     room.repairNeededBarriers().length
    return structures > 0 ? 1 : 0
  }

  makeDecisions() {
    if(this.memory.building && this.creep.carry.energy == 0) {
      this.memory.reparable = null
      this.memory.building = false
    }
    if(!this.memory.building && this.creep.isFull()) {
      this.memory.building = true
    }

    if(this.memory.building) {
      if (this.repair(this.room.rottingRamparts()) !== false) {
        return
      }
      if (this.build() !== false) {
        return
      }
      if (this.repair(this.room.repairNeededStructures(0.95)) !== false) {
        return
      }
      if (this.repair(this.room.repairNeededBarriers()) !== false) {
        return
      }
      return this.moveOffRoad()
    }

    if (this.collect() === false ) {
      if (!this.room.isEconomyWorking() ) {
        return this.harvest()
      }
    }
    this.moveOffRoad()
  }

}

module.exports = Builder
