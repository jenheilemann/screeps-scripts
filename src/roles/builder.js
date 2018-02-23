'use strict'

class Builder extends WorkerCreep {
  static role() {
    return 'builder'
  }

  static goalPopulation(roomManager) {
    var sites, progress, total, remaining
    sites = roomManager.constructionSites()

    if (sites.length == 0) {
      return this.repairGoalPopulation(roomManager)
    }
    progress = _.sum(_.map(sites, 'progress'))
    total = _.sum(_.map(sites, 'progressTotal'))
    remaining = total - progress

    if (remaining <= 15000) {
      return 1
    }
    return 2
  }

  static repairGoalPopulation(roomManager) {
    // includes roads!
    var structures = roomManager.repairNeededStructures().length +
                     roomManager.repairNeededBarriers().length
    return structures > 0 ? 1 : 0
  }

  makeDecisions() {
    if(this.creep.memory.building && this.creep.carry.energy == 0) {
      this.creep.memory.building = false;
    }
    if(!this.creep.memory.building && this.creep.carry.energy == this.creep.carryCapacity) {
      this.creep.memory.building = true;
    }

    if(this.creep.memory.building) {
      if (this.repairRottingRamparts() !== false) {
        return
      }
      if (this.build() !== false) {
        return
      }
      if (this.repair() !== false) {
        return
      }
      this.moveOffRoad()
    }

    if (this.collect() === false ) {
      if (!this.roomManager.isEconomyWorking() ) {
        return this.harvest()
      }
      this.moveOffRoad()
    }
  }

}

module.exports = Builder
