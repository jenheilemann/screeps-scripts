'use strict'

const CreepFactory = require('managers_creepfactory')
const CreepManager = require('managers_creep')
const TowerManager = require('managers_tower')
const Cache = require('lib_cache')

class RoomManager {

  constructor(room) {
    this.room = room
    this.cache = new Cache()
    if (!this.room.memory) {
      this.room.memory = {}
    }
  }

  run() {
    this.spawnCreeps()
    new CreepManager(this).run()
    new TowerManager(this).run()
  }

  spawnCreeps() {
    if ( this.spawns().length == 0 ) {
      return
    }

    if (!this.memory().censusTaken ) {
      this.memory().censusTaken = 0
    }

    if (this.spawns()[0].spawning != null) {
      return
    }

    if (Game.time - this.memory().censusTaken >= 59) {
      const PopulationManager = require('managers_population')
      var population = new PopulationManager(this)
      console.log(`Running census for room ${this.room.name}`)
      this.memory().nextCreep = population.neededRole()
      this.memory().censusTaken = Game.time
    }

    if (!this.memory().nextCreep) {
      return
    }

    var factory = new CreepFactory(this, this.memory().nextCreep, this.spawns()[0])
    if ( factory.buildCreep() ) {
      this.memory().nextCreep = false
    }
  }

  memory() {
    return this.room.memory
  }

  defconLevel() {
    return 0 // TODO https://arcath.net/2016/12/screeps-part-8-constructors-defcon/
  }

  controllerLevel() {
    if (!this.controller()) {
      return 0
    }
    return this.controller().level
  }

  controller() {
    return this.room.controller
  }

  oldestCreep() {
    return this.cache.remember('oldestCreep', function(self){
      return _.min(self.creeps(), (c) => c.ticksToLive)
    }, [this])
  }

  structures() {
    var structures = this.cache.remember('structures', function(self){
      return self.room.find(FIND_STRUCTURES, { filter: (s) => s.isActive() })
    }, [this])

    return structures
  }

  spawns() {
    return this.cache.remember('spawns', function(self){
      return self.room.find(FIND_MY_SPAWNS)
    }, [this]);
  }

  energyHogs() {
    return this.cache.remember('energyHogs', function(self){
      return _.filter(self.structures(), (structure) => {
        return structure.needsEnergy()
      });
    }, [this]);
  }

  constructionSites() {
    return this.cache.remember('constructionSites', function(self){
      return self.room.find(FIND_MY_CONSTRUCTION_SITES)
    }, [this]);
  }

  sources() {
    return this.cache.remember('sources', function(self){
      var sources = []
      if (self.memory().sources) {
        for (var i in self.memory().sources) {
          sources.push(Game.getObjectById(self.memory().sources[i]))
        }
      } else {
        sources = self.room.find(FIND_SOURCES)
        this.memory().sources = _.map(sources, 'id')
      }
      return sources
    }, [this]);
  }

  extensions() {
    return this.cache.remember('extensions', function(self){
      return _.filter(self.structures(), (s) => s.isExtension() )
    }, [this]);
  }

  containers() {
    return this.cache.remember('containers', function(self){
      return _.filter(self.structures(), (s) => s.isContainer() )
    }, [this]);
  }

  sourceContainers() {
    return this.cache.remember('sourceContainers', function(sources){
      return _.filter(_.map(sources, (s) => s.container()), (c) => c.exists())
    }, [this.sources()]);
  }

  openContainers() {
    return this.cache.remember('openContainers', function(containers, sContainers){
      return containers.filter((c) => !sContainers.includes(c))
    }, [this.containers(), this.sourceContainers()]);
  }

  barriers() {
    return this.cache.remember('barriers', function(structures){
      return structures.filter((s) => s.isBarrier())
    }, [this.structures()])
  }

  energyAvailableForSpawning() {
    return this.cache.remember('spawnEnergy', function(self){
      return _.sum(self.spawns(), 'energy') +
        _.sum(self.extensions(), 'energy') +
        _.sum(self.sourceContainers(), (c) => c.store.energy)
    }, [this]);
  }

  towers() {
    return this.cache.remember('towers', function(self){
      return _.filter(self.structures(), (s) => s.isTower() )
    }, [this]);
  }

  repairNeededStructures(percent = 0.8) {
    return this.cache.remember(`repairNeeded_${percent}`, function(self, percent){
      return _.filter(self.structures(),
        (s) => !s.isBarrier() && s.repairNeeded(percent))
    }, [this, percent])
  }

  repairNeededBarriers(percent = 0.8) {
    return this.cache.remember(`repairBarriers_${percent}`, function(barriers, percent){
      if (barriers.length == 0) {
        return []
      }

      var avg =  _.sum(barriers, 'hits') / barriers.length
      return _.filter(barriers, function(s) {
        return s.repairNeeded(percent) && (s.hits < avg + 4000 )
        });
    }, [this.barriers(), percent])
  }

  droppedEnergy() {
    return this.cache.remember('droppedEnergy', function(self){
      return _.sortBy(self.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY }}), 'amount')
    }, [this]);
  }

  isEconomyWorking() {
    return this.cache.remember('economyWorking', function(self){
      var harvesters = self.creepsByRole()['harvester'].length
      var couriers = self.creepsByRole()['courier'].length
      var sources = self.sources().length
      var containers = self.sourceContainers().length
      if (sources > 0 && harvesters > 0 && couriers > 0 && containers > 0 ) {
        return true
      }
      return false
    }, [this])
  }

  energyProduction() {
    return this.cache.remember('energyProduction', function(harvesters){
      var capacity = _.sum(harvesters, (h) => h.numParts(WORK))
      return capacity * 2
    }, [this.creepsByRole()['harvester']])
  }

  creeps() {
    return this.cache.remember('creeps', function(room){
      return room.find(FIND_MY_CREEPS)
    }, [this.room])
  }

  creepsByRole() {
    return this.cache.remember('creepsByRole', function(creeps) {
      var collection = {
        harvester: [],
        builder: [],
        courier: [],
        upgrader: [],
        defender: []
      }
      for (var i in creeps) {
        collection[creeps[i].memory.role].push(creeps[i])
      }
      return collection
    }, [this.creeps()])
  }

  enemies() {
    return this.cache.remember('enemies', function(room){
      return room.find(FIND_CREEPS, { filter: { my: false }})
    }, [this.room])
  }
}

module.exports = RoomManager
