'use strict'

Object.defineProperties(Room.prototype, {
  sources: {
    get: function () {
      return this.cache.remember('sources', function(self) {
        return _.map(self.survey.sources, (s) => Game.getObjectById(s.id))
      }, [this])
    },
    enumerable: false
  },

  repairManager: {
    get: function() {
      return this.cache.remember('repairManager', function(self) {
        let RepairManager = require('managers_repair')
        return new RepairManager(self)
      }, [this])
    },
    enumerable: false
  },

  constructionSites: {
    get: function() {
      return this.cache.remember('constructionSites', function(self) {
        let site_ids = sos.lib.cache.getOrUpdate(`room.${self.name}.constructionSites`,
            function() {
              let sites = self.find(FIND_MY_CONSTRUCTION_SITES)
              return _.map(sites, 'id')
            }.bind(self),
            { maxttl: 179, persist: true, refresh: false }
          )
        return _(site_ids).
          map((id) => Game.getObjectById(id)).
          filter((s) => s !== null).
          value()
      }, [this])
    },
    enumerable: false
  },

  allStructures: {
    get: function () {
      return this.cache.remember('allStructures', function(self){
        return self.find(FIND_STRUCTURES)
      }, [this])
    },
    enumerable: false
  },

  structures: {
    get: function () {
      return this.cache.remember('structures', function(self){
        return _.filter(self.allStructures, (s) => s.isActive() && (!s.isOwnable() || s.my) )
      }, [this])
    },
    enumerable: false
  },

  structuresByType: {
    get: function () {
      return this.cache.remember('structuresByType', function(self){
        return _.groupBy(self.structures, 'structureType')
      }, [this])
    },
    enumerable: false
  },

  hostileStructures: {
    get: function () {
      return this.cache.remember('hostileStructures', function(self){
        return _.filter(self.allStructures, (s) => s.isOwnable() && !s.my )
      }, [this])
    },
    enumerable: false
  },

  hostileStructuresByType: {
    get: function () {
      return this.cache.remember('hostileStructuresByType', function(self){
        return _.groupBy(self.hostileStructures, 'structureType')
      }, [this])
    },
    enumerable: false
  },

  spawns: {
    get: function () {
      return this.cache.remember('spanws', function(self){
        return self.structuresByType[STRUCTURE_SPAWN] || []
      }, [this])
    },
    enumerable: false
  },

  extensions: {
    get: function () {
      return this.cache.remember('extensions', function(self){
        return self.structuresByType[STRUCTURE_EXTENSION] || []
      }, [this])
    },
    enumerable: false
  },

  containers: {
    get: function () {
      return this.cache.remember('containers', function(self){
        return self.structuresByType[STRUCTURE_CONTAINER] || []
      }, [this])
    },
    enumerable: false
  },

  sourceContainers: {
    get: function() {
      return this.cache.remember('sourceContainers', function(sources){
        return _.filter(_.map(sources, (s) => s.container()), (c) => c.exists())
      }, [this.sources]);
    },
    enumerable: false
  },

  openContainers: {
    get: function() {
      return this.cache.remember('openContainers', function(containers, sContainers){
        return _.difference(containers, sContainers)
      }, [this.containers, this.sourceContainers]);
    },
    enumerable: false
  },

  towers: {
    get: function () {
      return this.cache.remember('towers', function(self){
        return self.structuresByType[STRUCTURE_TOWER] || []
      }, [this])
    },
    enumerable: false
  },

  barriers: {
    get: function() {
      return this.cache.remember('barriers', function(self){
        var ramparts = self.structuresByType[STRUCTURE_RAMPART] || []
        var walls = self.structuresByType[STRUCTURE_WALL] || []
        return ramparts.concat(walls)
      }, [this])
    },
    enumerable: false
  },

  hidingSpots: {
    get: function() {
      return this.cache.remember('hidingSpots', function(self){
        let ramparts = self.structuresByType[STRUCTURE_RAMPART] || []
        return _.filter(ramparts, (r) => {
          let structures = self.lookForAt(LOOK_STRUCTURES, r)
          // the only structure is the rampart
          if (structures.length == 1) {
            return true
          }
          return !_.any(structures, (o) => {
            return o.structureType !== STRUCTURE_ROAD &&
                   o.structureType !== STRUCTURE_RAMPART &&
                   o.structureType !== STRUCTURE_CONTAINER
          })
        })
      }, [this])
    },
    enumerable: false
  },
})

Room.prototype.repairNeededStructures = function(percent = 0.8) {
  return this.cache.remember(`repairNeeded_${percent}`, function(self, percent){
    return _.filter(self.structures, (s) => !s.isBarrier() && s.repairNeeded(percent))
  }, [this, percent])
}

Room.prototype.repairNeededBarriers = function(percent = 0.8) {
  if (this.barriers.length == 0) {
    return []
  }

  var avg = this.cache.remember('barrierAvgHits', function(barriers){
    return _.sum(barriers, 'hits') / barriers.length
  }, [this.barriers])
  var max = this.cache.remember('barrierMaxHits', function(self){
    return self.controllerLevel < 8 ? ONE_MILLION : THREE_HUNDRED_MILLION
  }, [this])

  return this.cache.remember(`repairBarriers_${percent}`,
    function(barriers, percent, avg){
      return _.filter(barriers, function(s) {
        return s.repairNeeded(percent) && (s.hits < avg + 4000 )
      });
    }, [this.barriers, percent, avg])
}

Room.prototype.rottingRamparts = function() {
  return this.cache.remember('rottingRamparts', function(barriers){
    return _.filter(barriers, (s) => s.isRampart() && s.hits < 600)
  }, [this.repairNeededBarriers()])
}
