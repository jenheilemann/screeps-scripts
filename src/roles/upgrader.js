'use strict'
const WorkerCreep = require(`roles_worker`)

class Upgrader extends WorkerCreep {
  static role() {
    return 'upgrader'
  }

  static goalPopulation(colony) {
    if (colony.defcon.level > 0)      { return 0 }
    if (colony.controller.level == 0) { return 0 }
    if (colony.controller.Level == 8) { return 1 }

    var energyPerTick = Math.floor(colony.energyProduction)
    var parts = this.orderParts(colony, {})
    // essentially _.filter(p, p == WORK).length (work parts per upgrader)
    var numWorkParts = _.sum(parts, (p) => p === WORK ? 1 : 0)
    var numBuilders = colony.creepsByRole('builder').length
    var numUpgraders = Math.floor(energyPerTick * 0.6/numWorkParts) - numBuilders

    return _.max([1, numUpgraders])
  }
}

module.exports = Upgrader
