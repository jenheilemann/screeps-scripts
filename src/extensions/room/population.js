'use strict'

Object.defineProperty(Room.prototype, 'colonyCreeps', {
  get: function () {
    let cached = sos.lib.cache.get(`${this.name}.colonyCreeps`)
    let creeps = {}
    let refreshCache = false

    if (cached && !_.isEmpty(cached)) {
      _.map(cached, function(id) {
        var creep = Game.getObjectById(id)
        if (creep) {
          creeps[id] = creep
        }
        refreshCache = true
      })
    }

    if (_.isEmpty(creeps) || refreshCache) {
      _.map(_.filter(Game.creeps, (c) => c.memory.colony === this.name), function(c) {
        creeps[c.id] = c
      })
      sos.lib.cache.set(`${this.name}.colonyCreeps`, Object.keys(creeps), {
        maxttl: 79,
        persist: true
      })
    }

    return creeps
  }
})

Room.prototype.creepsByRole = function(role) {
  var creeps = this.cache.remember('creepsByRole', function(self){
    return _.groupBy(self.colonyCreeps, (c) => c.memory.role)
  }, [this]);
  return creeps[role] || []
}

Object.defineProperty(Room.prototype, 'enemies', {
  get: function () {
    return this.cache.remember('enemies', function(self) {
      return self.find(FIND_CREEPS, { filter: { my: false }})
    }, [this])
  }
})
