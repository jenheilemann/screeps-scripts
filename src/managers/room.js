'use strict'

const CreepFactory = require('managers_creepfactory')
const CreepManager = require('managers_creep')
const TowerManager = require('managers_tower')
const Cache = require('lib_cache')
const DefconCalculator = require('lib_defcon_calculator')

class RoomManager {

  constructor(room) {
    this.room = room
    this.cache = new Cache()
    if (!this.room.memory) {
      this.room.memory = {}
    }
    this.memory = this.room.memory
    this.defcon = new DefconCalculator(self).level()
  }

  run() {
    this.spawnCreeps()
    new CreepManager(this).run()
    new TowerManager(this).run()
    this.activateSafeMode()
  }

  spawnCreeps() {
    if ( this.spawns().length == 0 ) {
      return
    }

    if (!this.memory.censusTaken ) {
      this.memory.censusTaken = 0
    }

    if (this.spawns()[0].spawning != null) {
      return
    }

    if (Game.time - this.memory.censusTaken >= 59) {
      const PopulationManager = require('managers_population')
      var population = new PopulationManager(this)
      console.log(`Running census for room ${this.room.name}`)
      this.memory.nextCreep = population.neededRole()
      this.memory.censusTaken = Game.time
    }

    if (!this.memory.nextCreep) {
      return
    }

    var factory = new CreepFactory(this, this.memory.nextCreep, this.spawns()[0])
    if ( factory.buildCreep() ) {
      this.memory.nextCreep = false
    }
  }

  activateSafeMode() {
    if (this.defcon.level == 0) {
      return
    }

    if (this.defcon.level > 0) {
      var result = OK
      if ( this.defcon.timer > 50) {
        console.log('activating safemode, defcon timer too big')
        // result = this.room.controller.activateSafeMode()
      }
      if ( this.structureWasDestroyed() ) {
        console.log('activating safemode, structure destroyed')
        // result = this.room.controller.activateSafeMode()
      }
      // if (result == OK) {
      //   this.defcon = this.defcon.reset()
      // }
    }

  }

  safeModeActive() {
    return this.cache.remember('safeModeActive', function(self) {
      return typeof(self.room.controller.safeMode) === 'number'
    }, [this])
  }

  structureWasDestroyed() {
    this.cache.remember('structureDestroyed', function(self) {
      var structures = self.structures()

      self.memory.previousStructureCount = self.memory.structureCount
      self.memory.structureCount = structures.length

      if (typeof(self.memory.previousStructureCount) === 'number' &&
        structures.length < self.memory.previousStructureCount) {
        return false
      }
      return true
    }, [this])

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
    return this.cache.remember('structures', function(self){
      return self.room.find(FIND_STRUCTURES, { filter: (s) => s.isActive() })
    }, [this])
  }

  structuresByType(type) {
    return this.cache.remember('structuresByType', function(structures) {
      return _.groupBy(structures, 'structureType')
    }, [this.structures()])[type] || []
  }

  spawns() {
    return this.cache.remember('spawns', function(self){
      return self.structuresByType(STRUCTURE_SPAWN)
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
      if (self.memory.sources) {
        for (var i in self.memory.sources) {
          sources.push(Game.getObjectById(self.memory.sources[i]))
        }
      } else {
        sources = self.room.find(FIND_SOURCES)
        this.memory.sources = _.map(sources, 'id')
      }
      return sources
    }, [this]);
  }

  extensions() {
    return this.cache.remember('extensions', function(self){
      return self.structuresByType(STRUCTURE_EXTENSION)
    }, [this]);
  }

  containers() {
    return this.cache.remember('containers', function(self){
      return self.structuresByType(STRUCTURE_CONTAINER)
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
    return this.cache.remember('barriers', function(self){
      var ramparts = self.structuresByType(STRUCTURE_RAMPART)
      var walls = self.structuresByType(STRUCTURE_WALL)
      return ramparts.concat(walls)
    }, [this])
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
      return self.structuresByType(STRUCTURE_TOWER)
    }, [this]);
  }

  storage() {
    return this.cache.remember('storage', function(self) {
      return self.structuresByType(STRUCTURE_STORAGE)[0]
    }, [this])
  }

  repairNeededStructures(percent = 0.8) {
    return this.cache.remember(`repairNeeded_${percent}`, function(self, percent){
      return _.filter(self.structures(),
        (s) => !s.isBarrier() && s.repairNeeded(percent))
    }, [this, percent])
  }

  repairNeededBarriers(percent = 0.8) {
    if (this.barriers().length == 0) {
      return []
    }

    var avg = this.cache.remember('barrierAvgHits', function(barriers){
      return _.sum(barriers, 'hits') / barriers.length
    }, [this.barriers()])
    var max = this.cache.remember('barrierMaxHits', function(self){
      return self.controllerLevel < 8 ? ONE_MILLION : THREE_HUNDRED_MILLION
    }, [this])

    return this.cache.remember(`repairBarriers_${percent}`,
      function(barriers, percent, avg){
        return _.filter(barriers, function(s) {
          return s.repairNeeded(percent) && (s.hits < avg + 4000 )
        });
      },
    [this.barriers(), percent, avg])
  }

  rottingRamparts() {
    return this.cache.remember('rottingRamparts', function(barriers){
      return _.filter(barriers, (s) => s.isRampart() && s.hits < 600)
    }, [this.repairNeededBarriers()])
  }

  droppedEnergy() {
    return this.cache.remember('droppedEnergy', function(self){
      return _.sortBy(self.room.find(FIND_DROPPED_RESOURCES, { filter: { resourceType: RESOURCE_ENERGY }}), 'amount')
    }, [this]);
  }

  isEconomyWorking() {
    return this.cache.remember('economyWorking', function(self){
      var harvesters = self.creepsByRole('harvester').length
      var couriers = self.creepsByRole('courier').length
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
    }, [this.creepsByRole('harvester')])
  }

  creeps() {
    return this.cache.remember('creeps', function(room){
      return room.find(FIND_MY_CREEPS)
    }, [this.room])
  }

  creepsByRole(role) {
    var creeps = this.cache.remember('creepsByRole', function(creeps) {
      return _.groupBy(creeps, (c) => c.memory.role)
    }, [this.creeps()])
    return creeps[role] || []
  }

  enemies() {
    return this.cache.remember('enemies', function(room){
      return room.find(FIND_CREEPS, { filter: { my: false }})
    }, [this.room])
  }
}

module.exports = RoomManager
