'use strict'

Object.defineProperties(Room.prototype, {
  sources: {
    get: function () {
      var source_ids = sos.lib.cache.get(`${this.name}.sources`)
      if (source_ids) {
        return this.cache.remember('sources', function(ids) {
          return _.map(ids, (id) => Game.getObjectById(id))
        }, [source_ids])
      }

      var sources = this.find(FIND_SOURCES)
      sos.lib.cache.set(`${this.name}.sources`, _.map(sources, 'id'), {
        persist: true
      })

      return sources
    }
  },

  constructionSites: {
    get: function() {
      let cached = sos.lib.cache.get(`${this.name}.constructionSites`)
      let sites = []
      let refreshCache = false

      if (cached && !_.isEmpty(cached)) {
        _.map(cached, function(id) {
          var site = Game.getObjectById(id)
          if (site) {
            sites.push(site)
          }
          refreshCache = true
        })
      }

      if (_.isEmpty(sites) || refreshCache) {
        sites = this.find(FIND_MY_CONSTRUCTION_SITES)
        sos.lib.cache.set(`${this.name}.constructionSites`, _.map(sites, 'id'), {
          maxttl: 179,
          persist: true
        })
      }

      return sites
    }
  },

  allStructures: {
    get: function () {
      let cached = sos.lib.cache.get(`${this.name}.allStructures`)
      let structures = []
      let refreshCache = false

      if (cached && !_.isEmpty(cached)) {
        _.map(cached, function(id) {
          var structure = Game.getObjectById(id)
          if (structure) {
            structures.push(structure)
          }
          refreshCache = true
        })
      }

      if (_.isEmpty(structures) || refreshCache) {
        structures = this.find(FIND_STRUCTURES)
        sos.lib.cache.set(`${this.name}.allStructures`, _.map(structures, 'id'), {
          maxttl: 179,
          persist: true
        })
      }

      return structures
    }
  },

  structures: {
    get: function () {
      return this.cache.remember('structures', function(self){
        return _.filter(self.allStructures, (s) => s.isActive() )
      }, [this])
    }
  },

  structuresByType: {
    get: function () {
      return this.cache.remember('structuresByType', function(self){
        return _.groupBy(self.structures, 'structureType')
      }, [this])
    }
  },

  spawns: {
    get: function () {
      return this.cache.remember('spanws', function(self){
        return self.structuresByType[STRUCTURE_SPAWN] || []
      }, [this])
    }
  },

  extensions: {
    get: function () {
      return this.cache.remember('extensions', function(self){
        return self.structuresByType[STRUCTURE_EXTENSION] || []
      }, [this])
    }
  },

  containers: {
    get: function () {
      return this.cache.remember('containers', function(self){
        return self.structuresByType[STRUCTURE_CONTAINER] || []
      }, [this])
    }
  },

  sourceContainers: {
    get: function() {
      return this.cache.remember('sourceContainers', function(sources){
        return _.filter(_.map(sources, (s) => s.container()), (c) => c.exists())
      }, [this.sources]);
    }
  },

  openContainers: {
    get: function() {
      return this.cache.remember('openContainers', function(containers, sContainers){
        return _.difference(containers, sContainers)
      }, [this.containers, this.sourceContainers]);
    }
  },

  towers: {
    get: function () {
      return this.cache.remember('towers', function(self){
        return self.structuresByType[STRUCTURE_TOWER] || []
      }, [this])
    }
  },

  barriers: {
    get: function() {
      return this.cache.remember('barriers', function(self){
        var ramparts = self.structuresByType[STRUCTURE_RAMPART] || []
        var walls = self.structuresByType[STRUCTURE_WALL] || []
        return ramparts.concat(walls)
      }, [this])
    }
  }
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
