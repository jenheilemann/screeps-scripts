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
}

module.exports = Builder
