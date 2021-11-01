'use strict'

class PopulationManager {

  constructor(room) {
    this.room = room
  }

  neededRole() {
    let self = this
    let rm = this.room
    let numExtensions = rm.extensions.length

    let needed = _.filter(Object.keys(DISTRIBUTION), function(role) {
      if (DISTRIBUTION[role].minExtensions > numExtensions) {
        return false
      }

      let total = rm.creepsByRole(role).length
      if ( total >= self.goalByRole(role) ) {
        return false
      }
      if (total >= DISTRIBUTION[role].max ) {
        return false
      }
      return true
    })

    if (needed.length == 0) {
      return false
    }

    return _.max(needed, function(role){
      return DISTRIBUTION[role].priority(rm)
    })
  }

  goalByRole(role) {
    return DISTRIBUTION[role].goal(this.room)
  }
}

// Distribution calculations per creep role.
// Most depend on variables from the room data. (`rm` == room)
const DISTRIBUTION = {
  harvester: {
    goal: function(rm){
      var couriers = rm.creepsByRole('courier')
      if (couriers.length == 0) {
        return 2 * rm.sources.length
      }
      return 1 * rm.sources.length
    },
    max: 6,
    minExtensions: 0,
    priority: function(rm) {
      var harvesters = rm.creepsByRole('harvester')
      if (harvesters.length == 0) {
        return 150
      }
      return 100
    }
  },
  courier: {
    goal: function(rm){
      var Courier = require('roles_courier')
      return Courier.goalPopulation(rm)
    },
    max: 10,
    minExtensions: 0,
    priority: function(rm) {
      var couriers = rm.creepsByRole('courier')
      if (couriers.length == 0) {
        return 140
      }
      return 90
    }
  },
  builder: {
    goal: function(rm){
      var Builder = require('roles_builder')
      return Builder.goalPopulation(rm)
    },
    max: 2,
    minExtensions: 0,
    priority: function(rm) {
      var builders = rm.creepsByRole('builder')
      if (builders.length == 0) {
        return 50
      }
      return 40
    }
  },
  upgrader:  {
    goal: function(rm) {
      var Upgrader = require('roles_upgrader')
      return Upgrader.goalPopulation(rm)
    },
    max: 5,
    minExtensions: 0,
    priority: function(rm) {
      var upgraders = rm.creepsByRole('upgrader')
      if (upgraders.length == 0) {
        return 60
      }
      return 30
    }
  },
  defender:  {
    goal: function(rm) {
      return 0
      return (rm.defcon.level-1) * 2
    },
    max: 6,
    minExtensions: 3,
    priority: function(rm) { return 110 }
  },
  scout:  {
    goal: function(rm) {
      return 1
    },
    max: 2,
    minExtensions: 6,
    priority: function(rm) { return 20 }
  }
}

module.exports = PopulationManager
