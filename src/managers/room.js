'use strict'

const CreepFactory = require('managers_creepfactory')
const CreepManager = require('managers_creep')

class RoomManager {

  constructor(room) {
    this.room = room
    if (!this.room.memory) {
      this.room.memory = {}
    }
  }

  run() {
    this.spawnCreeps()
    new CreepManager(this).run()
  }

  spawnCreeps() {
    if ( this.spawns().length == 0 ) {
      return
    }

    if (!this.memory().censusTaken || Game.time - this.memory().censusTaken >= 59 ) {
      const PopulationManager = require('managers_population')
      var population = new PopulationManager(this)
      console.log(`Running census for room ${this.room.name}`)
      this.memory().nextCreep = population.neededRole()
      this.memory().censusTaken = Game.time
    }

    if (!this.memory().nextCreep) {
      return
    }

    var factory = new CreepFactory(this, this.memory().nextCreep)
    if ( factory.buildCreep() ) {
      this.memory().nextCreep = null
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
    if (!this._oldestCreep) {
      if (this.memory().oldestCreep) {
        this._oldestCreep = Game.getObjectById(this.memory().oldestCreep)
      } else {
        this._oldestCreep = _.minBy(creeps(), 'ticksToLive')
      }
    }
    if (!this.memory().oldestCreep) {
      this.memory().oldestCreep = this._oldestCreep.id
    }
    return this._oldestCreep
  }

  structures() {
    if (!this._structures) {
      this._structures = this.room.find(FIND_STRUCTURES);
    }
    if (!this.memory().structures || this.memory().structures.length != this._structures.length) {
      this.memory().structures = _.map(this._structures, `id`)
    }

    return this._structures
  }

  spawns() {
    if (!this._spawns) {
      this._spawns = this.room.find(FIND_MY_SPAWNS)
    }
    if (!this.memory().spawns || this.memory().spawns.length != this._spawns.length) {
      this.memory().spawns = _.map(this._spawns, 'id')
    }

    return this._spawns
  }

  energyHogs() {
    if (!this._energyHogs) {
      this._energyHogs = _.filter(this.structures(), (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        });
    }

    return this._energyHogs
  }

  constructionSites() {
    if (!this._constructionSites) {
      this._constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
    }

    return this._constructionSites
  }

  sources() {
    if (!this._sources) {
      this._sources = []
      if (this.memory().sources) {
        for (var i in this.memory().sources) {
          this._sources.push(Game.getObjectById(this.memory().sources[i]))
        }
      } else {
        this._sources = this.room.find(FIND_SOURCES)
      }
    }
    if (!this.memory().sources) {
      this.memory().sources = _.map(this._sources, 'id')
    }
    return this._sources
  }

  extensions() {
    if (!this._extensions) {
      this._extensions = _.filter(this.structures(),
        (s) => s.structureType == STRUCTURE_EXTENSION )
    }
    return this._extensions
  }

  containers() {
    if (!this._containers) {
      this._containers = _.filter(this.structures(),
        (s) => s.structureType == STRUCTURE_CONTAINER )
    }
    return this._containers
  }

  repairNeededStructures(percent = 0.8) {
    if (!this._repairNeeded) {
      this._repairNeeded = _.filter(this.structures(),
        (s) => !s.isBarrier() && s.repairNeeded(percent))
    }
    return this._repairNeeded
  }

  repairNeededBarriers(percent = 0.8) {
    var barriers
    if (!this._repairBarriers) {
      barriers = _.filter(this.structures(), (s) => s.isBarrier())
      if (barriers.length == 0) {
        return this._repairBarriers = []
      }

      var avg =  _.sum(barriers, 'hits') / barriers.length
      this._repairBarriers = _.filter(this.structures(),
        (s) => s.repairNeeded(percent) && (s.hits < avg + 5000 || s.hits < 200000) )
    }
    return this._repairBarriers
  }

  creepsByRole() {
    if (!this._creepsByRole) {
      this._creepsByRole = {
        harvester: [],
        builder: [],
        courier: [],
        upgrader: [],
        defender: [],
        handybot: []
      }
      var creeps = this.creeps()
      for (var i in creeps) {
        this._creepsByRole[creeps[i].memory.role].push(creeps[i])
      }
    }
    return this._creepsByRole
  }

  creeps() {
    if (!this._creeps) {
      this._creeps = this.room.find(FIND_MY_CREEPS)
    }
    return this._creeps
  }
}

module.exports = RoomManager
