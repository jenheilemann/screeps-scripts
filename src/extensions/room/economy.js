'use strict'

Object.defineProperties(Room.prototype, {
  energyProduction: {
    get: function () {
      return this.cache.remember('energyProduction', function(harvesters){
        var capacity = _.sum(harvesters, (h) => h.numParts(WORK))
        return capacity * 2
      }, [this.creepsByRole('harvester')])
    }
  },
})

Room.prototype.isEconomyWorking = function() {
  return this.cache.remember('economyWorking', function(self){
    var harvesters = self.creepsByRole('harvester').length
    var couriers = self.creepsByRole('courier').length
    var sources = self.sources.length
    var containers = self.sourceContainers.length
    if (sources > 0 && harvesters > 0 && couriers > 0 && containers > 0 ) {
      return true
    }
    return false
  }, [this])
}

Room.prototype.energyAvailableForSpawning = function() {
  return this.cache.remember('spawnEnergy', function(self){
      return _.sum(self.spawns, 'energy') +
        _.sum(self.extensions, 'energy') +
        _.sum(self.sourceContainers, (c) => c.store.energy)
  }, [this])
}

Room.prototype.droppedEnergy = function() {
  return this.cache.remember('droppedEnergy', function(self){
    return _.sortBy(self.find(FIND_DROPPED_RESOURCES,
      { filter: { resourceType: RESOURCE_ENERGY }}), 'amount')
  }, [this]);
}
