'use strict'

class PopulationManager {

  constructor(roomManager) {
    this._roomManager = roomManager
    this._population = this.calculateDistribution()
  }

  neededRole() {
    var needed = []
    var count

    for (var role in this._population) {
      if (this._population[role].minExtensions > this._roomManager.extensions().length) {
        continue;
      }
      if (this._population[role].total < this._population[role].goal &&
          this._population[role].total < this._population[role].max ) {
        count = this._population[role].goal - this._population[role].total
        needed.push([role, count])
      }
    }

    if (needed.length == 0) {
      return false
    }

    var sorted = _.sortBy(needed, function(value){
      if (value[0] == 'harvester') {
        return -100
      }

      return -value[1]
    });

    return sorted[0][0]
  }

  calculateDistribution() {
    var distribution = {}
    var creepsByRole = this._roomManager.creepsByRole()

    for (var role in POPULATION_DISTRIBUTION) {
      var goal = POPULATION_DISTRIBUTION[role].goal(this._roomManager)
      distribution[role] = {
        total: creepsByRole[role].length,
        goal: goal,
        max: POPULATION_DISTRIBUTION[role].max,
        minExtensions: POPULATION_DISTRIBUTION[role].minExtensions
      }
    }
    return distribution
  }

}

// Distribution calculations per creep role.
// Most depend on variables from the room data. (`rm` == roomManager)
const POPULATION_DISTRIBUTION = {
  harvester: {
    goal: function(rm){
      var couriers = rm.creepsByRole()['courier']
      if (couriers.length == 0) {
        return 2 * rm.sources().length
      }
      return 1 * rm.sources().length
    },
    max: 10,
    minExtensions: 0
  },
  builder:   {
    goal: function(rm){
      var sites, progress, total, remaining
      sites = rm.constructionSites()

      progress = _.sum(_.map(sites, 'progress'))
      total = _.sum(_.map(sites, 'progressTotal'))
      remaining = total - progress

      return Math.ceil(remaining/6000)
    },
    max: 7,
    minExtensions: 0
  },
  courier:   {
    goal: function(rm){
      var containers = _.filter(_.map(rm.sources(), (s) => s.container()), (c) => !c.isNull() )
      return Math.floor(rm.energyHogs().length/7) + containers.length
    },
    max: 10,
    minExtensions: 0
  },
  upgrader:  {
    goal: function(rm) {
      if (rm.controllerLevel() == 0) {
        return 0
      }

      if (rm.controllerLevel() == 8) {
        return 1
      }

      return Math.ceil(rm.controllerLevel()/2) + 1
    },
    max: 4,
    minExtensions: 0
  },
  defender:  {
    goal: function(rm) {
      return rm.defconLevel() + 1
    },
    max: 6,
    minExtensions: 3
  },
  handybot:{
    goal: function(rm) {
      // includes roads!
      var structures = rm.repairNeededStructures().length
      var barriers = rm.repairNeededBarriers().length
      var weightedTotal = structures + barriers * 0.5
      return Math.ceil(weightedTotal/12)
    },
    max: 3,
    minExtensions: 2
  }
}

module.exports = PopulationManager
