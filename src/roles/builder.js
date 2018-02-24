'use strict'
const WorkerCreep = require(`roles_worker`)

class Builder extends WorkerCreep {
  static role() {
    return 'builder'
  }

  static goalPopulation(roomManager) {
    if (roomManager.defcon.level > 0) {
      return 0
    }
    var sites = roomManager.constructionSites()

    if (sites.length == 0) {
      return this.repairGoalPopulation(roomManager)
    }
    var progress = _.sum(_.map(sites, 'progress'))
    var total = _.sum(_.map(sites, 'progressTotal'))
    var remaining = total - progress

    if (remaining <= 15000) {
      return 1
    }
    return 2
  }

  static repairGoalPopulation(roomManager) {
    var towers = roomManager.towers().length
    if (towers > 0) {
      return 0
    }

    // includes roads!
    var structures = roomManager.repairNeededStructures().length +
                     roomManager.repairNeededBarriers().length
    return structures > 0 ? 1 : 0
  }

  makeDecisions() {
    if (this.renewOrRecycle(this.roomManager.spawns()[0]) !== false) {
      return
    }

    if(this.memory.building && this.creep.carry.energy == 0) {
      this.memory.reparable = null
      this.memory.building = false
    }
    if(!this.memory.building && this.creep.isFull()) {
      this.memory.building = true
    }

    if(this.memory.building) {
      if (this.repair(this.roomManager.rottingRamparts()) !== false) {
        return
      }
      if (this.build() !== false) {
        return
      }
      if (this.repair(this.roomManager.repairNeededStructures(0.95)) !== false) {
        return
      }
      if (this.repair(this.roomManager.repairNeededBarriers()) !== false) {
        return
      }
      return this.moveOffRoad()
    }

    if (this.collect() === false ) {
      if (!this.roomManager.isEconomyWorking() ) {
        return this.harvest()
      }
    }
    this.moveOffRoad()
  }

}

module.exports = Builder
